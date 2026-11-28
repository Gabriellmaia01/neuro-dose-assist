package com.neurodose.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Proteção de borda HTTP:
 * 1) Limita o tamanho máximo do payload JSON (mitiga DoS de memória/armazenamento no Atlas);
 * 2) Aplica rate limiting em janela fixa de 60s por IP para rotas públicas e autenticadas.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestProtectionFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L;

    @Value("${app.security.max-payload-bytes:262144}")
    private long maxPayloadBytes;

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.security.rate-limit.public-rpm:60}")
    private int publicRequestsPerMinute;

    @Value("${app.security.rate-limit.api-rpm:300}")
    private int apiRequestsPerMinute;

    private static final class WindowCounter {
        volatile long windowStartMs;
        final AtomicInteger count = new AtomicInteger(0);

        WindowCounter(long startMs) {
            this.windowStartMs = startMs;
        }
    }

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (request.getContentLengthLong() > maxPayloadBytes) {
            writeJsonError(
                    response,
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "payload-too-large",
                    "O corpo da requisição excede o limite máximo permitido."
            );
            return;
        }

        if (rateLimitEnabled && !"OPTIONS".equalsIgnoreCase(request.getMethod())) {
            String path = request.getRequestURI();
            boolean isPublicRoute = "/api/v1/health".equals(path)
                    || ("GET".equalsIgnoreCase(request.getMethod()) && path.matches("^/api/v1/clinics/[^/]+/invites/[^/]+$"));
            int limit = isPublicRoute ? publicRequestsPerMinute : apiRequestsPerMinute;
            String bucketKey = resolveClientIp(request) + ":" + (isPublicRoute ? "pub" : "api");

            if (!tryAcquire(bucketKey, limit)) {
                response.setHeader("Retry-After", "60");
                writeJsonError(
                        response,
                        HttpStatus.TOO_MANY_REQUESTS,
                        "rate-limit-exceeded",
                        "Muitas requisições em curto período. Aguarde um minuto e tente novamente."
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean tryAcquire(String key, int limit) {
        long now = System.currentTimeMillis();
        if (counters.size() > 10_000) {
            counters.entrySet().removeIf(e -> (now - e.getValue().windowStartMs) > WINDOW_MS);
        }

        WindowCounter counter = counters.computeIfAbsent(key, k -> new WindowCounter(now));
        synchronized (counter) {
            if (now - counter.windowStartMs >= WINDOW_MS) {
                counter.windowStartMs = now;
                counter.count.set(0);
            }
            return counter.count.incrementAndGet() <= limit;
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "unknown";
    }

    private void writeJsonError(
            HttpServletResponse response,
            HttpStatus status,
            String code,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String body = "{\"code\":\"" + code + "\",\"message\":\"" + message + "\",\"status\":"
                + status.value() + ",\"timestamp\":\"" + Instant.now() + "\"}";
        response.getWriter().write(body);
    }
}
