import { DEFAULT_BUSINESSES, DEFAULT_BUSINESS_ID } from "@/constants/businesses";
import {
  getStoredActiveBusinessId,
  listBusinesses,
  storeActiveBusinessId,
} from "@/database/businesses";
import type { BusinessId, BusinessRecord } from "@/types/business";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";

import { Loading } from "@/components/Loading";

type BusinessContextValue = {
  activeBusiness: BusinessRecord;
  activeBusinessId: BusinessId;
  businesses: BusinessRecord[];
  setActiveBusinessId: (businessId: BusinessId) => Promise<void>;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

type BusinessProviderProps = {
  children: ReactNode;
};

export function BusinessProvider({ children }: BusinessProviderProps) {
  const db = useSQLiteContext();
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [activeBusinessId, setActiveBusinessIdState] =
    useState<BusinessId>(DEFAULT_BUSINESS_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadBusinesses() {
      setIsLoading(true);

      try {
        const [availableBusinesses, storedBusinessId] = await Promise.all([
          listBusinesses(db),
          getStoredActiveBusinessId(db),
        ]);

        if (!isActive) {
          return;
        }

        const fallbackBusinessId =
          availableBusinesses[0]?.id ?? DEFAULT_BUSINESS_ID;
        const resolvedBusinessId = availableBusinesses.some(
          (business) => business.id === storedBusinessId,
        )
          ? storedBusinessId
          : fallbackBusinessId;

        setBusinesses(availableBusinesses);
        setActiveBusinessIdState(resolvedBusinessId);
      } catch (error) {
        console.error(error);

        if (isActive) {
          setBusinesses(DEFAULT_BUSINESSES);
          setActiveBusinessIdState(DEFAULT_BUSINESS_ID);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadBusinesses();

    return () => {
      isActive = false;
    };
  }, [db]);

  const setActiveBusinessId = useCallback(
    async (businessId: BusinessId) => {
      setActiveBusinessIdState(businessId);

      try {
        await storeActiveBusinessId(db, businessId);
      } catch (error) {
        console.error(error);
      }
    },
    [db],
  );

  const activeBusiness = useMemo(() => {
    return (
      businesses.find((business) => business.id === activeBusinessId) ??
      businesses[0] ??
      null
    );
  }, [activeBusinessId, businesses]);

  const contextValue = useMemo(() => {
    if (!activeBusiness) {
      return null;
    }

    return {
      activeBusiness,
      activeBusinessId: activeBusiness.id,
      businesses,
      setActiveBusinessId,
    };
  }, [activeBusiness, businesses, setActiveBusinessId]);

  if (isLoading || !contextValue) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loading />
      </View>
    );
  }

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }

  return context;
}
