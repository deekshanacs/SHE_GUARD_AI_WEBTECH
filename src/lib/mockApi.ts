// Type definitions shared across pages
export interface AnalysisResult {
  caseId: string;
  imageStatus: "Safe" | "Suspicious" | "Manipulated";
  confidenceScore: number;
  forensicScore: number;
  timestamp: string;
  riskLevel: "green" | "yellow" | "red";
  details: {
    faceManipulation: number;
    spliceDetection: number;
    metadataAnomaly: number;
    noiseAnalysis: number;
  };
  elaApplicable?: boolean;
}

export interface IncidentReport {
  caseId: string;
  name: string;
  gender: string;
  status: string;
  submittedAt: string;
}
