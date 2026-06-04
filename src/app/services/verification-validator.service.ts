import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ConfidenceScore {
  total: number;
  breakdown: {
    criteria: string;
    points: number;
    maxPoints: number;
    passed: boolean;
  }[];
  recommendation: 'APPROVE' | 'MANUAL_REVIEW' | 'INSUFFICIENT';
  recommendationText: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationValidatorService {

  private readonly RC_PATTERN = /^[A-Z]\d{7,12}$/;
  private readonly TAX_NUMBER_PATTERN = /^\d{7}\/[A-Z]\/[A-Z]\/\d{3}$/;
  private readonly WEBSITE_PATTERN = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\/.*)?$/i;

  private readonly POINTS_DOCUMENT = 40;
  private readonly POINTS_SECTOR = 20;
  private readonly POINTS_RC_FORMAT = 20;
  private readonly POINTS_WEBSITE = 10;
  private readonly POINTS_DESCRIPTION = 10;

  private readonly THRESHOLD_APPROVE = 70;
  private readonly THRESHOLD_MANUAL_REVIEW = 40;

  validateBusinessRegistrationNumber(rcNumber: string): ValidationResult {
    if (!rcNumber || rcNumber.trim() === '') {
      return { isValid: false, message: 'Le numéro d\'immatriculation est requis' };
    }

    const cleaned = rcNumber.trim().toUpperCase().replace(/\s+/g, '');
    
    if (this.RC_PATTERN.test(cleaned)) {
      return { isValid: true, message: 'Format RC valide' };
    }

    if (this.TAX_NUMBER_PATTERN.test(rcNumber.trim())) {
      return { isValid: true, message: 'Format matricule fiscal valide' };
    }

    return { 
      isValid: false, 
      message: 'Format invalide. Utilisez le format RC (ex: B1234567890) ou MF (ex: 1234567/A/M/000)' 
    };
  }

  validateWebsite(url: string): ValidationResult {
    if (!url || url.trim() === '') {
      return { isValid: true, message: 'Optionnel' };
    }

    if (this.WEBSITE_PATTERN.test(url.trim())) {
      return { isValid: true, message: 'URL valide' };
    }

    return { isValid: false, message: 'URL invalide' };
  }

  validateDescription(description: string): ValidationResult {
    if (!description || description.trim() === '') {
      return { isValid: true, message: 'Optionnel' };
    }

    if (description.trim().length >= 50) {
      return { isValid: true, message: 'Description suffisante' };
    }

    return { 
      isValid: false, 
      message: `Description trop courte (${description.trim().length}/50 caractères minimum)` 
    };
  }

  calculateConfidenceScore(
    hasDocument: boolean,
    rcNumber: string,
    sector: string,
    website: string,
    description: string
  ): ConfidenceScore {
    const breakdown: ConfidenceScore['breakdown'] = [];
    let totalScore = 0;

    breakdown.push({
      criteria: 'Document justificatif fourni',
      points: hasDocument ? this.POINTS_DOCUMENT : 0,
      maxPoints: this.POINTS_DOCUMENT,
      passed: hasDocument
    });
    if (hasDocument) totalScore += this.POINTS_DOCUMENT;

    const hasSector = !!(sector && sector.trim() !== '');
    breakdown.push({
      criteria: 'Secteur d\'activité renseigné',
      points: hasSector ? this.POINTS_SECTOR : 0,
      maxPoints: this.POINTS_SECTOR,
      passed: hasSector
    });
    if (hasSector) totalScore += this.POINTS_SECTOR;

    const rcValidation = this.validateBusinessRegistrationNumber(rcNumber);
    breakdown.push({
      criteria: 'Format RC/Matricule Fiscal valide',
      points: rcValidation.isValid ? this.POINTS_RC_FORMAT : 0,
      maxPoints: this.POINTS_RC_FORMAT,
      passed: rcValidation.isValid
    });
    if (rcValidation.isValid) totalScore += this.POINTS_RC_FORMAT;

    const websiteValidation = this.validateWebsite(website);
    const hasValidWebsite = !!(website && website.trim() !== '' && websiteValidation.isValid);
    breakdown.push({
      criteria: 'Site web valide',
      points: hasValidWebsite ? this.POINTS_WEBSITE : 0,
      maxPoints: this.POINTS_WEBSITE,
      passed: hasValidWebsite
    });
    if (hasValidWebsite) totalScore += this.POINTS_WEBSITE;

    const hasDescription = !!(description && description.trim().length >= 50);
    breakdown.push({
      criteria: 'Description détaillée (50+ caractères)',
      points: hasDescription ? this.POINTS_DESCRIPTION : 0,
      maxPoints: this.POINTS_DESCRIPTION,
      passed: hasDescription
    });
    if (hasDescription) totalScore += this.POINTS_DESCRIPTION;

    let recommendation: ConfidenceScore['recommendation'];
    let recommendationText: string;

    if (totalScore >= this.THRESHOLD_APPROVE && hasDocument) {
      recommendation = 'APPROVE';
      recommendationText = 'Score suffisant avec document fourni. Approbation recommandée.';
    } else if (totalScore >= this.THRESHOLD_MANUAL_REVIEW) {
      recommendation = 'MANUAL_REVIEW';
      recommendationText = 'Score moyen. Vérification manuelle recommandée.';
    } else {
      recommendation = 'INSUFFICIENT';
      recommendationText = 'Score insuffisant. Informations complémentaires requises.';
    }

    return {
      total: totalScore,
      breakdown,
      recommendation,
      recommendationText
    };
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }

  getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'APPROVE': return '#22c55e';
      case 'MANUAL_REVIEW': return '#f59e0b';
      case 'INSUFFICIENT': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getRecommendationClass(recommendation: string): string {
    switch (recommendation) {
      case 'APPROVE': return 'recommendation-approve';
      case 'MANUAL_REVIEW': return 'recommendation-review';
      case 'INSUFFICIENT': return 'recommendation-insufficient';
      default: return '';
    }
  }
}
