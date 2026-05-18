export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very'
  | 'extra';

export type Goal = 'lose' | 'maintain' | 'gain';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export const GOAL_ADJUSTMENTS_KCAL: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export type CalorieInput = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type CalorieResult = {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  activityMultiplier: number;
  goalAdjustmentKcal: number;
};

export function roundKcal(n: number) {
  return Math.round(n);
}

export function calcBmrMifflinStJeor({ weightKg, heightCm, ageYears, gender }: Pick<CalorieInput, 'weightKg' | 'heightCm' | 'ageYears' | 'gender'>) {
  // Erkek: 10*w + 6.25*h - 5*a + 5
  // Kadın: 10*w + 6.25*h - 5*a - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateCalorieRecommendation(input: CalorieInput): CalorieResult {
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
  const goalAdjustmentKcal = GOAL_ADJUSTMENTS_KCAL[input.goal];

  const bmr = calcBmrMifflinStJeor(input);
  const tdee = bmr * activityMultiplier;
  const recommendedCalories = tdee + goalAdjustmentKcal;

  return {
    bmr: roundKcal(bmr),
    tdee: roundKcal(tdee),
    recommendedCalories: roundKcal(recommendedCalories),
    activityMultiplier,
    goalAdjustmentKcal,
  };
}
