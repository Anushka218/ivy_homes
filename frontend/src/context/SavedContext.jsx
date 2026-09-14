import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../hooks/useAuth.js';
import { savedService } from '../services/savedService.js';

const SavedContext =
  createContext(null);

export function SavedProvider({
  children,
}) {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  const [
    savedListings,
    setSavedListings,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [
    savingIds,
    setSavingIds,
  ] = useState(() => new Set());

  const savedIds = useMemo(
    () =>
      new Set(
        savedListings
          .map(
            (item) =>
              item?.listing_id
          )
          .filter(Boolean)
      ),
    [savedListings]
  );

  const refreshSaved =
    useCallback(async () => {
      if (!isAuthenticated) {
        setSavedListings([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results =
          await savedService.getSavedListings();

        setSavedListings(
          results.filter(
            (item) =>
              item?.listing_id
          )
        );
      } catch (err) {
        setError(
          err.message ||
            'Failed to load saved listings'
        );
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshSaved();
    } else {
      setSavedListings([]);
      setError(null);
    }
  }, [
    isAuthenticated,
    user?.email,
    refreshSaved,
  ]);

  const toggleSave =
    useCallback(
      async (listing) => {
        const id =
          listing?.listing_id;

        if (
          !id ||
          savingIds.has(id)
        ) {
          return;
        }

        const wasSaved =
          savedIds.has(id);

        setSavingIds(
          (current) =>
            new Set(
              current
            ).add(id)
        );

        if (wasSaved) {
          setSavedListings(
            (current) =>
              current.filter(
                (item) =>
                  item.listing_id !== id
              )
          );
        } else {
          setSavedListings(
            (current) => [
              listing,
              ...current.filter(
                (item) =>
                  item.listing_id !== id
              ),
            ]
          );
        }

        try {
          if (wasSaved) {
            await savedService.removeSavedListing(
              id
            );
          } else {
            await savedService.addSavedListing(
              id
            );
          }
        } catch (err) {
          setSavedListings(
            (current) => {
              if (wasSaved) {
                return [
                  listing,
                  ...current.filter(
                    (item) =>
                      item.listing_id !== id
                  ),
                ];
              }

              return current.filter(
                (item) =>
                  item.listing_id !== id
              );
            }
          );

          setError(
            err.message ||
              'Unable to update saved listing'
          );

          throw err;
        } finally {
          setSavingIds(
            (current) => {
              const next =
                new Set(current);

              next.delete(id);

              return next;
            }
          );
        }
      },
      [savedIds, savingIds]
    );

  const value = {
    savedListings,
    savedIds,
    savedCount:
      savedListings.length,
    loading,
    error,

    isSaved: (id) =>
      savedIds.has(id),

    isSaving: (id) =>
      savingIds.has(id),

    toggleSave,

    refreshSaved,
  };

  return (
    <SavedContext.Provider
      value={value}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context =
    useContext(SavedContext);

  if (!context) {
    throw new Error(
      'useSaved must be used within a SavedProvider'
    );
  }

  return context;
}