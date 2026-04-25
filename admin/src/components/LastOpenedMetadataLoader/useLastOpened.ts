import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

//
// Types
//

import type { ContentTypeUID, DocumentID, LastOpened } from '../../types';

/**
 * Represents the different states of a fetch workflow.
 */
export enum FetchStatus {
  Initial = 'initial',
  InProgress = 'in-progress',
  Success = 'success',
  Failure = 'failure',
}

/**
 * A discriminated union describing the current state of last-opened fetch process.
 * Each state can optionally include payload data relevant to that stage.
 */
type LastOpenedFetchState =
  | { status: FetchStatus.Initial }
  | { status: FetchStatus.InProgress }
  | { status: FetchStatus.Success; lastOpened: LastOpened }
  | { status: FetchStatus.Failure; error: unknown };

//
// Config
//

const config = {
  /** The configuration for the last-opened request. */
  lastOpenedRequest: {
    /** The path to fetch the last-opened metadata for the entity with the given `uid` and `documentId`. */
    path: (uid: string, documentId: string) =>
      `/document-metadata/last-opened/${uid}/${documentId}`,
  },
};

//
// Hook
//

export const useLastOpened = ({
  uid,
  documentId,
  locale,
}: {
  uid: ContentTypeUID;
  documentId: DocumentID;
  locale: string | undefined;
}) => {
  const fetchClient = useFetchClient();
  const [lastOpenedFetchState, setLastOpenedFetchState] = useState<LastOpenedFetchState>({
    status: FetchStatus.Initial,
  });

  useEffect(
    () => {
      const abortController = new AbortController();
      setLastOpenedFetchState({ status: FetchStatus.Initial });

      const fetchLastOpened = async () => {
        setLastOpenedFetchState({ status: FetchStatus.InProgress });

        try {
          const { data: lastOpened } = await fetchClient.post<LastOpened>(
            config.lastOpenedRequest.path(uid, documentId),
            {},
            {
              params: { locale },
              signal: abortController.signal,
            }
          );

          setLastOpenedFetchState({ status: FetchStatus.Success, lastOpened });
        } catch (error) {
          if (abortController.signal.aborted) {
            // Silently ignore errors caused by an intentional abort.
            return;
          }

          console.error('Failed to fetch last-opened metadata', error);
          setLastOpenedFetchState({ status: FetchStatus.Failure, error });
        }
      };

      fetchLastOpened();

      return () => {
        abortController.abort();
      };
    },
    // - Note: `fetchClient` is stable across renders.
    [fetchClient, uid, documentId, locale]
  );

  return lastOpenedFetchState;
};
