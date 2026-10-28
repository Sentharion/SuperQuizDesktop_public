import { supabase } from '../lib/supabase';

export const getQuestionsForGame = async (count = 300) => {
  try {
    const { data, error } = await supabase.rpc('get_random_questions', {
      count_param: count
    });

    if (error) {
      console.error('Błąd RPC:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Nieoczekiwany błąd:', err);
    return null;
  }
};

export const getEasyQuestionsForGame = async (count = 500) => {
  try {
    const { data, error } = await supabase.rpc('get_random_easy_questions', {
      count_param: count
    });

    if (error) {
      console.error('Błąd RPC:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Nieoczekiwany błąd:', err);
    return null;
  }
};