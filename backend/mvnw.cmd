@ECHO OFF
SETLOCAL

SET "WRAPPER_DIR=%~dp0"
SET "MAVEN_VERSION=3.9.9"
SET "MAVEN_HOME_PARENT=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
SET "MAVEN_HOME=%MAVEN_HOME_PARENT%\apache-maven-%MAVEN_VERSION%"
SET "MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

IF NOT EXIST "%MAVEN_CMD%" (
    ECHO Downloading Apache Maven %MAVEN_VERSION%...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ErrorActionPreference = 'Stop'; " ^
      "New-Item -ItemType Directory -Force -Path '%MAVEN_HOME_PARENT%' | Out-Null; " ^
      "$zip = '%MAVEN_HOME_PARENT%\maven.zip'; " ^
      "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
      "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile $zip; " ^
      "Expand-Archive -Path $zip -DestinationPath '%MAVEN_HOME_PARENT%' -Force; " ^
      "Remove-Item $zip -Force"
    IF ERRORLEVEL 1 EXIT /B 1
)

CALL "%MAVEN_CMD%" %*
EXIT /B %ERRORLEVEL%
