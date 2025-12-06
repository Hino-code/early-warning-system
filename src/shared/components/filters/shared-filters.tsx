import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { format } from "date-fns";
import type { FilterValues } from "@/shared/types/filters";
import { createDefaultFilters } from "@/shared/types/filters";

interface SharedFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  showAdvanced?: boolean;
  compact?: boolean;
  primaryOnly?: boolean;
}

export function SharedFilters({
  filters,
  onFilterChange,
  showAdvanced = true,
  compact = false,
  primaryOnly = false,
}: SharedFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(
    filters.dateRange?.start
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(
    filters.dateRange?.end
  );

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    const defaults = createDefaultFilters();
    onFilterChange(defaults);
    setDateRangeStart(defaults.dateRange?.start);
    setDateRangeEnd(defaults.dateRange?.end);
  };

  const applyDateRange = () => {
    if (dateRangeStart && dateRangeEnd) {
      updateFilter("dateRange", { start: dateRangeStart, end: dateRangeEnd });
    }
  };

  const clearDateRange = () => {
    setDateRangeStart(undefined);
    setDateRangeEnd(undefined);
    updateFilter("dateRange", null);
  };

  const hasActiveFilters =
    filters.season !== "All" ||
    filters.fieldStage !== "All" ||
    filters.pestType !== "All" ||
    filters.thresholdStatus !== "All" ||
    filters.actionStatus !== "All";

  return (
    <Card className={compact ? "p-3" : "p-4 mb-6"}>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {/* Primary Filters */}
        {!compact && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Filters</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        )}

        <div
          className={`flex items-center ${
            compact
              ? "gap-2 flex-wrap"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          }`}
        >
          {compact && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 ml-auto"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          {/* Year */}
          <div className={compact ? "" : "space-y-2"}>
            {!compact && (
              <label className="text-sm text-muted-foreground">Year</label>
            )}
            <Select
              value={filters.year.toString()}
              onValueChange={(val) => updateFilter("year", parseInt(val))}
            >
              <SelectTrigger className={compact ? "h-9 w-[120px]" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pest Type */}
          <div className={compact ? "" : "space-y-2"}>
            {!compact && (
              <label className="text-sm text-muted-foreground">Pest Type</label>
            )}
            <Select
              value={filters.pestType}
              onValueChange={(val) => updateFilter("pestType", val as any)}
            >
              <SelectTrigger className={compact ? "h-9 w-[180px]" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All (Black Rice Bug)</SelectItem>
                <SelectItem value="Black Rice Bug">Black Rice Bug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className={compact ? "" : "space-y-2"}>
            {!compact && (
              <label className="text-sm text-muted-foreground">
                Date Range
              </label>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={
                    compact
                      ? "h-9 w-[200px] justify-start text-left"
                      : "w-full justify-start text-left"
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange ? (
                    <span className="truncate">
                      {format(filters.dateRange.start, "MMM d")} -{" "}
                      {format(filters.dateRange.end, "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm">Start Date</label>
                    <Calendar
                      mode="single"
                      selected={dateRangeStart}
                      onSelect={setDateRangeStart}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">End Date</label>
                    <Calendar
                      mode="single"
                      selected={dateRangeEnd}
                      onSelect={setDateRangeEnd}
                      disabled={(date) =>
                        dateRangeStart ? date < dateRangeStart : false
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={applyDateRange}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearDateRange}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between mt-2"
              >
                <span className="text-sm">Advanced Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    advancedOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                {/* Season */}
                {primaryOnly && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Season
                    </label>
                    <Select
                      value={filters.season}
                      onValueChange={(val) =>
                        updateFilter("season", val as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Seasons</SelectItem>
                        <SelectItem value="Dry">Dry Season</SelectItem>
                        <SelectItem value="Wet">Wet Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Field Stage */}
                {primaryOnly && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Field Stage
                    </label>
                    <Select
                      value={filters.fieldStage}
                      onValueChange={(val) => updateFilter("fieldStage", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Stages</SelectItem>
                        <SelectItem value="Seedling">Seedling</SelectItem>
                        <SelectItem value="Vegetative">Vegetative</SelectItem>
                        <SelectItem value="Reproductive">
                          Reproductive
                        </SelectItem>
                        <SelectItem value="Ripening">Ripening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Threshold Status */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Threshold Status
                  </label>
                  <Select
                    value={filters.thresholdStatus}
                    onValueChange={(val) =>
                      updateFilter("thresholdStatus", val as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Below">Below Threshold</SelectItem>
                      <SelectItem value="Above">Above Threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Status */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Action Status
                  </label>
                  <Select
                    value={filters.actionStatus}
                    onValueChange={(val) =>
                      updateFilter("actionStatus", val as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Actions</SelectItem>
                      <SelectItem value="Taken">Action Taken</SelectItem>
                      <SelectItem value="Not Taken">No Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </Card>
  );
}
