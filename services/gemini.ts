
import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioResult, RiskAnalysisResult, ArticleAnalysisResult, TermExplanation, DebtItem, DebtAnalysisResult } from "../types";

export class GeminiFinanceService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async analyzeScenario(prompt: string): Promise<ScenarioResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are a world-class financial actuary and advisor. 
        Your goal is to simulate financial "What-If" scenarios.
        When given a scenario (like buying a car, stopping a coffee habit, or retirement savings), calculate the long-term impact over a logical timeframe (usually 10-30 years depending on the query).
        
        Return a JSON object with title, summary, recommendation, and projections.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            projections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.NUMBER },
                  conservative: { type: Type.NUMBER },
                  moderate: { type: Type.NUMBER },
                  aggressive: { type: Type.NUMBER }
                },
                required: ["year", "conservative", "moderate", "aggressive"]
              }
            }
          },
          required: ["title", "summary", "recommendation", "projections"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{}');
      return data as ScenarioResult;
    } catch (error) {
      throw new Error("The advisor encountered an error calculating your scenario.");
    }
  }

  async analyzeRisk(portfolioDescription: string): Promise<RiskAnalysisResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following portfolio: ${portfolioDescription}`,
      config: {
        systemInstruction: `You are a professional investment risk analyst. Analyze the user's asset allocation and provide a comprehensive "Risk Report Card".`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING },
            analysis: { type: Type.STRING },
            diversificationScore: { type: Type.NUMBER },
            concentrationRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            comparisons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  model: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suitability: { type: Type.STRING }
                },
                required: ["model", "description", "suitability"]
              }
            },
            topAdvice: { type: Type.STRING }
          },
          required: ["score", "riskLevel", "analysis", "diversificationScore", "concentrationRisks", "comparisons", "topAdvice"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}') as RiskAnalysisResult;
    } catch (error) {
      throw new Error("Failed to analyze portfolio risk.");
    }
  }

  async analyzeArticle(text: string): Promise<ArticleAnalysisResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this financial text and identify up to 10 complex terms to explain: ${text}`,
      config: {
        systemInstruction: `You are a financial educator specializing in ELI5 (Explain Like I'm 5). Identify jargon and complex financial terms and provide ELI5 definitions and analogies.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  analogy: { type: Type.STRING }
                },
                required: ["term", "definition", "analogy"]
              }
            }
          },
          required: ["explanations"]
        }
      }
    });

    try {
      const result = JSON.parse(response.text || '{}');
      return {
        annotatedText: text,
        explanations: result.explanations as TermExplanation[]
      };
    } catch (error) {
      throw new Error("Failed to analyze article.");
    }
  }

  async analyzeDebt(debts: DebtItem[], extraPayment: number, preference: 'quick-win' | 'save-money'): Promise<DebtAnalysisResult> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these debts: ${JSON.stringify(debts)} with an extra monthly payment of $${extraPayment}. User prefers: ${preference}.`,
      config: {
        systemInstruction: `You are a debt reduction strategist. 
        1. Calculate two payoff paths: Snowball (lowest balance first) and Avalanche (highest interest first).
        2. Account for monthly compounding interest on the balance.
        3. Determine payoff order, total interest paid, and months until debt-free for both.
        4. Provide monthly balance snapshots (limit to 24 snapshots for visualization, or quarterly for long-term).
        5. Provide a behavioral recommendation based on the user's preference.
        6. Calculate exact interest saved by using Avalanche over Snowball.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            behavioralRecommendation: { type: Type.STRING },
            interestSavedByAvalanche: { type: Type.NUMBER },
            snowball: {
              type: Type.OBJECT,
              properties: {
                totalInterest: { type: Type.NUMBER },
                monthsToPayoff: { type: Type.NUMBER },
                payoffOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
                monthlyData: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.NUMBER },
                      totalBalance: { type: Type.NUMBER },
                      interestPaid: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            avalanche: {
              type: Type.OBJECT,
              properties: {
                totalInterest: { type: Type.NUMBER },
                monthsToPayoff: { type: Type.NUMBER },
                payoffOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
                monthlyData: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.NUMBER },
                      totalBalance: { type: Type.NUMBER },
                      interestPaid: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          required: ["summary", "behavioralRecommendation", "interestSavedByAvalanche", "snowball", "avalanche"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}') as DebtAnalysisResult;
    } catch (error) {
      throw new Error("Failed to calculate debt strategy.");
    }
  }
}

export const financeService = new GeminiFinanceService();
