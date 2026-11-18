"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { Genre, Movie, MovieStatus } from "@/lib/home/types";
import {
  isMovieCatalogPage,
  type MovieCatalogPage,
  type MoviePerson,
  type MovieShowDate,
} from "@/lib/movies/types";
import { MoviesContent } from "./movies-content";
import { listingHref, type MovieQueryState } from "./movies-utils";

type MoviesPageProps = {
  status: MovieStatus;
  query: string;
  genres: Genre[];
  people: MoviePerson[];
  peopleError: string | null;
  selectedGenres: string[];
  selectedShowDate: MovieShowDate;
  selectedCastId: number | null;
  catalog: MovieCatalogPage | null;
  error: string | null;
};

type LoadedMoviePage = {
  criteriaKey: string;
  items: Movie[];
  nextCursor: string | null;
};

export function MoviesPage({
  status,
  query,
  genres,
  people,
  peopleError,
  selectedGenres,
  selectedShowDate,
  selectedCastId,
  catalog,
  error,
}: MoviesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query);
  const [loadedPage, setLoadedPage] = useState<LoadedMoviePage | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const currentState: MovieQueryState = {
    status,
    query,
    genres: selectedGenres,
    showDate: selectedShowDate,
    castId: selectedCastId,
  };
  const criteriaKey = JSON.stringify([
    status,
    query,
    selectedGenres,
    selectedShowDate,
    selectedCastId,
  ]);
  const items =
    loadedPage?.criteriaKey === criteriaKey
      ? loadedPage.items
      : (catalog?.items ?? []);
  const nextCursor =
    loadedPage?.criteriaKey === criteriaKey
      ? loadedPage.nextCursor
      : (catalog?.nextCursor ?? null);
  const hasMore = Boolean(nextCursor);
  const hasAppliedCriteria =
    Boolean(query) ||
    selectedGenres.length > 0 ||
    selectedShowDate !== "any" ||
    selectedCastId !== null;
  function navigate(next: Partial<MovieQueryState>) {
    startTransition(() => {
      router.push(listingHref({ ...currentState, ...next }));
    });
  }

  function clearAllFilters() {
    setSearchValue("");
    navigate({
      query: "",
      genres: [],
      showDate: "any",
      castId: null,
    });
  }

  function clearQuery() {
    setSearchValue("");
    navigate({ query: "" });
  }

  function clearSearchAndFilters() {
    setSearchValue("");
    navigate({
      query: "",
      genres: [],
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ query: searchValue.trim() });
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setLoadMoreError(null);
    const params = new URLSearchParams({
      status,
      cursor: nextCursor,
    });
    if (query) params.set("q", query);
    for (const genre of selectedGenres) params.append("genres", genre);
    if (selectedShowDate !== "any") {
      params.set("showDate", selectedShowDate);
    }
    if (selectedCastId !== null) {
      params.set("cast", String(selectedCastId));
    }

    try {
      const response = await fetch(`/api/movies?${params.toString()}`, {
        headers: { accept: "application/json" },
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "We couldn't load more movies. Please try again.";
        throw new Error(message);
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("items" in payload) ||
        !isMovieCatalogPage(payload)
      ) {
        throw new Error("The movie service returned an invalid page.");
      }

      const pageItems = payload.items;
      const seen = new Set(items.map((movie) => movie.id));
      setLoadedPage({
        criteriaKey,
        items: [
          ...items,
          ...pageItems.filter((movie) => !seen.has(movie.id)),
        ],
        nextCursor: payload.nextCursor,
      });
    } catch (caught) {
      setLoadMoreError(
        caught instanceof Error
          ? caught.message
          : "We couldn't load more movies. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <MoviesContent
      status={status}
      query={query}
      genres={genres}
      people={people}
      peopleError={peopleError}
      selectedGenres={selectedGenres}
      selectedShowDate={selectedShowDate}
      selectedCastId={selectedCastId}
      catalog={catalog}
      error={error}
      searchValue={searchValue}
      items={items}
      hasMore={hasMore}
      hasAppliedCriteria={hasAppliedCriteria}
      loadingMore={loadingMore}
      filterPending={isPending}
      loadMoreError={loadMoreError}
      onSearchValueChange={setSearchValue}
      onSubmitSearch={submitSearch}
      onNavigate={navigate}
      onClearAllFilters={clearAllFilters}
      onClearQuery={clearQuery}
      onClearSearchAndFilters={clearSearchAndFilters}
      onLoadMore={loadMore}
      onRetry={() => router.refresh()}
    />
  );
}
