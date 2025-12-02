"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, Minus, Plus, Sun, Moon, Book, Paintbrush } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BookSettings } from "@/lib/types";

type ReaderControlsProps = {
  settings: BookSettings;
  onSettingsChange: (newSettings: Partial<BookSettings>) => void;
};

const FONT_STEP = 1;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;

export function ReaderControls({
  settings,
  onSettingsChange,
}: ReaderControlsProps) {
    const handleThemeChange = (theme: BookSettings['theme']) => {
        onSettingsChange({ theme });
    }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Reading settings">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Display Settings</SheetTitle>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          {/* Font Size */}
          <div className="grid gap-3">
            <Label htmlFor="font-size">Font Size</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  onSettingsChange({ fontSize: Math.max(MIN_FONT_SIZE, settings.fontSize - FONT_STEP) })
                }
                disabled={settings.fontSize <= MIN_FONT_SIZE}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-medium">{settings.fontSize}px</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  onSettingsChange({ fontSize: Math.min(MAX_FONT_SIZE, settings.fontSize + FONT_STEP) })
                }
                disabled={settings.fontSize >= MAX_FONT_SIZE}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Color Theme */}
          <div className="grid gap-3">
             <Label>Color Theme</Label>
             <div className="grid grid-cols-2 gap-2">
                <Button variant={settings.theme === 'light' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('light')}><Sun className="mr-2 h-4 w-4" /> Light</Button>
                <Button variant={settings.theme === 'dark' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('dark')}><Moon className="mr-2 h-4 w-4" /> Dark</Button>
                <Button variant={settings.theme === 'sepia' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('sepia')}><Book className="mr-2 h-4 w-4" /> Sepia</Button>
                <Button variant={settings.theme === 'indigo' ? 'secondary' : 'outline'} onClick={() => handleThemeChange('indigo')}><Paintbrush className="mr-2 h-4 w-4" /> Indigo</Button>
             </div>
          </div>
          
          {/* Animation Style */}
           <div className="grid gap-3">
             <Label>Page Transition</Label>
             <div className="grid grid-cols-2 gap-2">
                <Button variant={settings.animation === 'slide' ? 'secondary' : 'outline'} onClick={() => onSettingsChange({ animation: 'slide' })}>Slide</Button>
                <Button variant={settings.animation === 'fade' ? 'secondary' : 'outline'} onClick={() => onSettingsChange({ animation: 'fade' })}>Fade</Button>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
