import IcChevronRight from 'public/assets/icons/ic_chevron_right.svg';

export type ConceptCategory = {
  id: string;
  name: string;
  count: number;
  concepts?: Array<{ id: string; name: string }>;
};

type ConceptCategoryItemProps = {
  category: ConceptCategory;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ConceptCategoryItem({ category, isExpanded, onToggle }: Readonly<ConceptCategoryItemProps>) {
  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        className={`border border-[#d0d8e9] h-[52px] w-full flex items-center px-4 py-3 ${
          isExpanded ? 'bg-[#f8f9fb] rounded-tl-lg rounded-tr-lg' : 'bg-white rounded-lg'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <IcChevronRight className={`w-4 h-4 text-[#697086] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <div className="flex items-center gap-1 text-sm text-[#22283a]">
            <span>{category.name}</span>
            <span className="text-[#697086]">({category.count})</span>
          </div>
        </div>
      </button>
      {isExpanded && category.concepts && category.concepts.length > 0 && (
        <div className="bg-white border-x border-b border-[#d0d8e9] rounded-bl-lg rounded-br-lg px-3 py-3">
          <ul className="list-disc list-inside text-sm text-[#697086] space-y-1">
            {category.concepts.map((concept) => (
              <li key={concept.id}>{concept.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
