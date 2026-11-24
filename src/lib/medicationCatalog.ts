export const therapeuticClassColors: Record<string, string> = {
  Psicoestimulante: "bg-info/10 text-info border-info/20",
  "Antidepressivo IRSN": "bg-secondary text-secondary-foreground",
  "Antipsicótico Atípico": "bg-warning/10 text-warning border-warning/20",
  "Antidepressivo ISRS": "bg-success/10 text-success border-success/20",
  "Estabilizador de Humor": "bg-primary/10 text-primary border-primary/20",
  Benzodiazepínico: "bg-destructive/10 text-destructive border-destructive/20",
};

export const therapeuticClassMap: Record<string, string> = {
  stimulant: "Psicoestimulante",
  "antidepressant-irsn": "Antidepressivo IRSN",
  "antidepressant-isrs": "Antidepressivo ISRS",
  antipsychotic: "Antipsicótico Atípico",
  stabilizer: "Estabilizador de Humor",
  benzo: "Benzodiazepínico",
};

export const formMap: Record<string, string> = {
  tablet: "Comprimido",
  capsule: "Cápsula",
  solution: "Solução",
  injection: "Injetável",
};
