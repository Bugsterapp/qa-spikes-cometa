import { useSession } from 'next-auth/react';
import { useLocalStorage } from 'usehooks-ts';
import { useSelectedSchool } from '../guards/AuthGuard';

/**
 * Custom hook to manage and persist the state of selected rows in a report configuration.
 * It leverages the user's session and the currently selected school to uniquely identify
 * the persisted state. This allows the application to remember the user's selected rows
 * across sessions and page reloads.
 *
 * @returns A tuple containing the current state of selected rows and a setter function
 * to update the state. The state is persisted across sessions using the `useLocalStorage` hook.
 */
export const useReportConfig = (key?: string) => {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  // Use the `useLocalStorage` hook to create a stateful value and a function to update it.
  // The state is persisted with a unique key combining the user's ID and the school's name.
  const [selectedRows, setSelectedRows] = useLocalStorage<string[]>(
    `${session?.user.id}-${selectedSchool?.name}${key ? `-${key}` : ''}-selectedRows`,
    []
  );
  return [selectedRows, setSelectedRows] as const;
};
