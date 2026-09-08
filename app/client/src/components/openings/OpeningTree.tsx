import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, GitBranch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type OpeningTreeItem = {
  id: string;
  slug: string;
  eco: string;
  name: string;
  depth: number;
  trainable: boolean;
};

export function OpeningTree({
  items,
  selectedSlug,
  onSelect,
}: {
  items: readonly OpeningTreeItem[];
  selectedSlug?: string | null;
  onSelect: (item: OpeningTreeItem) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, OpeningTreeItem[]>();
    for (const item of items) {
      const values = map.get(item.eco) ?? [];
      values.push(item);
      map.set(item.eco, values);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([eco, values]) => ({ eco, values: values.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name)) }));
  }, [items]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!groups.length) return;
    setExpanded(current => current.size ? current : new Set(groups.slice(0, 4).map(group => group.eco)));
  }, [groups]);

  const toggle = (eco: string) => setExpanded(current => {
    const next = new Set(current);
    if (next.has(eco)) next.delete(eco);
    else next.add(eco);
    return next;
  });

  if (!groups.length) return <p className="opening-empty-state">No opening lines match this search.</p>;

  return (
    <div className="opening-tree" role="tree" aria-label="ECO opening tree">
      {groups.map(group => {
        const isExpanded = expanded.has(group.eco);
        return (
          <div className="opening-tree-group" key={group.eco}>
            <button
              type="button"
              className="opening-tree-eco"
              aria-expanded={isExpanded}
              onClick={() => toggle(group.eco)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <strong>{group.eco}</strong>
              <span>{group.values.length} lines</span>
            </button>
            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  className="opening-tree-lines"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {group.values.map(item => (
                    <button
                      type="button"
                      role="treeitem"
                      key={item.id}
                      aria-current={selectedSlug === item.slug ? "true" : undefined}
                      className={`opening-tree-line ${selectedSlug === item.slug ? "is-active" : ""}`}
                      onClick={() => onSelect(item)}
                    >
                      <GitBranch size={12} aria-hidden="true" />
                      <span>{item.name}</span>
                      {item.trainable ? <i title="Trainable line">T</i> : null}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
