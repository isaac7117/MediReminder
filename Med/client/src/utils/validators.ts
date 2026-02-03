export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateMedicationName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100;
};

export const validateDosage = (dosage: string): boolean => {
  return dosage.length > 0 && dosage.length <= 100;
};

export const validateFrequencyValue = (value: number): boolean => {
  return value > 0 && value <= 24;
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};
