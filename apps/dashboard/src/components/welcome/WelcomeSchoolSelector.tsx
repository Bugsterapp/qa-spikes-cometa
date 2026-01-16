import { useState } from 'react';
import { useRouter } from 'next/router';
import { useGetSchools, useSelectedSchool, useSetSelectedSchool } from '../../guards/AuthGuard';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Button } from '@cometa/recreo/v2';
import { PATH_PORTAL } from '../../routes/paths';

function DarkArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#212B36"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WelcomeSchoolSelector() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const schools = useGetSchools();
  const selectedSchool = useSelectedSchool();
  const setSelectedSchool = useSetSelectedSchool();

  if (schools.length <= 1) {
    return null;
  }

  const selectItem = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setOpen(false);
    router.push(PATH_PORTAL.charge.root);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          data-testid="welcome-school-selector"
          aria-expanded={open}
          className="flex bg-[#F3F6FB] border-none flex-shrink-0 px-4 justify-between h-8 min-w-[180px]"
        >
          <div className="text-[#212B36] font-semibold flex-shrink-0 line-clamp-1 max-w-[140px] text-start text-sm">
            <span>{selectedSchool?.name}</span>
          </div>
          <DarkArrowDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[208px] p-0 shadow-schoolSelector">
        <Command className="z-30">
          {schools.length > 3 && (
            <>
              <CommandInput placeholder="Buscar" className="bg-[#F3F6FB] border-none ring-0" />
              <CommandEmpty>No se encontró ninguna escuela</CommandEmpty>
            </>
          )}
          <CommandList className="z-30 customScrollbar">
            <CommandGroup>
              {schools.map((school) => (
                <CommandItem
                  className="cursor-pointer z-30 text-[#717993] hover:bg-[#F3F6FB] hover:text-[#212B36] flex px-2 py-3 items-center"
                  key={school.id}
                  value={school.name}
                  data-testid={`${school.name}-option`}
                  onSelect={() => {
                    selectItem(school.id);
                    setOpen(false);
                  }}
                >
                  <span className="line-clamp-2 font-lota">{school.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
