"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  cases as seedCases,
  clients as seedClients,
  type CaseItem,
} from "@/data/cases";

export type NewCaseInput = {
  caseTitle: string;
  processNumber?: string;
  clientSlug: string;
  status: CaseItem["status"];
  nextHearing?: string;
  lawyerName: string;
};

type CasesContextValue = {
  cases: CaseItem[];
  addCase: (input: NewCaseInput) => CaseItem;
  listCasesByClient: (clientSlug: string) => CaseItem[];
  findCase: (clientSlug: string, caseSlug: string) => CaseItem | undefined;
};

const CasesContext = createContext<CasesContextValue | undefined>(undefined);

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function uniqueCaseSlug(title: string, existing: Set<string>) {
  const base = slugify(title) || "caso";
  let candidate = base;
  let suffix = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CaseItem[]>(() => seedCases.slice());

  const addCase = useCallback(
    (input: NewCaseInput) => {
      const existingSlugs = new Set(items.map((c) => c.caseSlug));
      const client = seedClients.find((c) => c.slug === input.clientSlug);

      const newItem: CaseItem = {
        clientSlug: input.clientSlug,
        clientName: client?.name ?? input.clientSlug,
        caseSlug: uniqueCaseSlug(input.caseTitle, existingSlugs),
        caseTitle: input.caseTitle,
        processNumber: input.processNumber?.trim() || "-",
        status: input.status,
        nextHearing: input.nextHearing?.trim() || "Sem audiência definida",
        lawyerName: input.lawyerName.trim() || "Dra. Elena Silva",
      };

      setItems((prev) => [newItem, ...prev]);
      return newItem;
    },
    [items],
  );

  const listCasesByClient = useCallback(
    (clientSlug: string) =>
      items.filter((item) => item.clientSlug === clientSlug),
    [items],
  );

  const findCase = useCallback(
    (clientSlug: string, caseSlug: string) =>
      items.find(
        (item) => item.clientSlug === clientSlug && item.caseSlug === caseSlug,
      ),
    [items],
  );

  const value = useMemo<CasesContextValue>(() => {
    return { cases: items, addCase, listCasesByClient, findCase };
  }, [items, addCase, listCasesByClient, findCase]);

  return (
    <CasesContext.Provider value={value}>{children}</CasesContext.Provider>
  );
}

export function useCasesContext(): CasesContextValue {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error("useCases deve ser usado com CasesProvider.");
  return ctx;
}
