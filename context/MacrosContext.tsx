import { Meal } from "@/components/MealDetailDialog";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, useCallback, useContext, useState } from "react";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type Goals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MacrosContextType = {
  todayTotals: Totals;
  todayMeals: Meal[];
  userGoals: Goals;
  fetchTodayProgress: () => Promise<void>;
  fetchUserGoals: () => Promise<void>;
  deleteMeal: (id: number) => Promise<void>;
  searchDate: (date: Date) => Promise<Meal[]>;
  searchFavoriteMeals: () => Promise<Meal[]>;
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
  const [userGoals, setUserGoals] = useState<Goals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
  });

  const fetchUserGoals = useCallback(async () => {
    const result = await db.getAllAsync<Goals>(
      `SELECT calories, protein, carbs, fats FROM users ORDER BY id DESC LIMIT 1;`,
    );
    if (result[0]) {
      setUserGoals(result[0]);
    }
  }, [db]);

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
        SELECT id, name, calories, protein, carbs, fats, ingredients
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

  const searchDate = useCallback(
    async (date: Date) => {
      const mealsResult = await db.getAllAsync<Meal>(
        `
        SELECT id, name, calories, protein, carbs, fats, ingredients
        FROM meals
        WHERE date = ?;
      `,
        [date.toISOString().split("T")[0]],
      );
      return mealsResult;
    },
    [db],
  );

  const searchFavoriteMeals = useCallback(async () => {
    const mealsResult = await db.getAllAsync<Meal>(
      `
        SELECT id, name, calories, protein, carbs, fats, ingredients
        FROM meals
        WHERE isFavorite = 1;
      `,
    );
    return mealsResult;
  }, [db]);

  const deleteMeal = useCallback(
    async (id: number) => {
      await db.runAsync(`DELETE FROM meals WHERE id = ?;`, [id]);
      await fetchTodayProgress();
    },
    [db, fetchTodayProgress],
  );

  return (
    <MacrosContext.Provider
      value={{
        todayTotals,
        todayMeals,
        userGoals,
        fetchTodayProgress,
        fetchUserGoals,
        deleteMeal,
        searchDate,
        searchFavoriteMeals,
      }}
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
