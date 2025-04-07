import OpenAI from 'openai';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';

export const openai = new OpenAI({
  apiKey: EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // required for React Native or Expo
});
