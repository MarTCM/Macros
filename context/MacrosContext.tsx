import { Meal } from "@/components/MealDetailDialog";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, useCallback, useContext, useState } from "react";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MacrosContextType = {
  todayTotals: Totals;
  todayMeals: Meal[];
  fetchTodayProgress: () => Promise<void>;
};

const MacrosContext = createContext<MacrosContextType | null>(null);

export function MacrosProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [todayTotals, setTodayTotals] = useState<Totals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);

  const fetchTodayProgress = useCallback(async () => {
    const [totalsResult, mealsResult] = await Promise.all([
      db.getAllAsync<{
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fats: number | null;
      }>(`
        SELECT 
          SUM(calories) as calories, 
          SUM(protein) as protein, 
          SUM(carbs) as carbs, 
          SUM(fats) as fats 
        FROM meals 
        WHERE date = CURRENT_DATE;
      `),
      db.getAllAsync<Meal>(`
        SELECT id, name, calories, protein, carbs, fats
        FROM meals
        WHERE date = CURRENT_DATE
        ORDER BY id DESC;
      `),
    ]);

    if (totalsResult[0]) {
      setTodayTotals({
        calories: totalsResult[0].calories ?? 0,
        protein: totalsResult[0].protein ?? 0,
        carbs: totalsResult[0].carbs ?? 0,
        fats: totalsResult[0].fats ?? 0,
      });
    }
    setTodayMeals(mealsResult);
  }, [db]);

  return (
    <MacrosContext.Provider
      value={{ todayTotals, todayMeals, fetchTodayProgress }}
    >
      {children}
    </MacrosContext.Provider>
  );
}
export function useMacros() {
  const ctx = useContext(MacrosContext);
  if (!ctx) throw new Error("useMacros must be used within a MacrosProvider");
  return ctx;
}
