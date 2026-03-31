interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {categories.map((category) => {
        const isActive = selected === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${isActive 
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            {category.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
