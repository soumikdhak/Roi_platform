import crypto from 'crypto'

export const generatereferralCode= () => {
  return crypto.randomUUID();
}


