/**
 * Whether an item's primary tag fields match the selected primary filter slots (OR between distinct tags).
 */
export function itemMatchesPrimarySelection(item, primaryTags) {
  const selected = (primaryTags || []).filter((p) => p !== 'all');
  if (selected.length === 0) return true;
  const unique = [...new Set(selected)];
  return unique.some((p) => item.tag1 === p || item.tag2 === p);
}

/**
 * Apply the same filter rules used for the main list and for alphabet availability.
 * @param {object} item - Parsed database row
 * @param {object} filters - Current filter state
 * @param {{ includeLetter?: boolean }} options - Set includeLetter: false to ignore `filters.letters` (e.g. alphabet availability)
 */
export function matchesFilters(item, filters, options = {}) {
  const { includeLetter = true } = options;

  if (includeLetter) {
    const letters = filters.letters || [];
    if (
      letters.length > 0 &&
      !letters.includes(item.firstLetter)
    ) {
      return false;
    }
  }

  const matchesPrimaryTag = itemMatchesPrimarySelection(item, filters.primaryTags);
  const matchesProvider =
    filters.provider === 'all' || item.provider === filters.provider;

  const selectedSecondaryTags = (filters.secondaryTags || []).filter(
    (tag) => tag !== 'all'
  );
  const uniqueSecondaryTags = [...new Set(selectedSecondaryTags)];
  const hasSecondarySelection = uniqueSecondaryTags.length > 0;
  const matchesAnySelectedSecondary =
    !hasSecondarySelection ||
    uniqueSecondaryTags.some((tag) => item.tags.includes(tag));
  const matchesAllSelectedSecondary =
    !hasSecondarySelection ||
    uniqueSecondaryTags.every((tag) => item.tags.includes(tag));

  const hasPrimarySelection = (filters.primaryTags || []).some(
    (p) => p !== 'all'
  );
  const hasProviderSelection = filters.provider !== 'all';

  const activeChecks = [];
  if (hasPrimarySelection) activeChecks.push(matchesPrimaryTag);
  if (hasSecondarySelection) {
    activeChecks.push(
      filters.matchMode === 'AND'
        ? matchesAllSelectedSecondary
        : matchesAnySelectedSecondary
    );
  }
  if (hasProviderSelection) activeChecks.push(matchesProvider);

  if (filters.matchMode === 'OR_ANY') {
    return activeChecks.length === 0 ? true : activeChecks.some(Boolean);
  }
  if (filters.matchMode === 'PRIMARY_AND_SECONDARY_OR') {
    const matchesRequiredPrimary = !hasPrimarySelection || matchesPrimaryTag;
    const matchesRequiredSecondary = hasSecondarySelection
      ? matchesAnySelectedSecondary
      : true;
    return (
      matchesRequiredPrimary &&
      matchesRequiredSecondary &&
      (!hasProviderSelection || matchesProvider)
    );
  }
  return activeChecks.length === 0 ? true : activeChecks.every(Boolean);
}
