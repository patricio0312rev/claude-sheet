import {
  Command,
  Slash,
  ArrowUpRight,
  Layers,
  LockKeyhole,
  Webhook,
  Zap,
  SlidersHorizontal,
  Network,
  RotateCcw,
  Crosshair,
  Code,
  Cast,
  List,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const SECTION_ICONS: Record<string, LucideIcon> = {
  'keyboard-shortcuts': Command,
  'slash-commands': Slash,
  'cli-launch-flags': ArrowUpRight,
  'the-big-5--claude-code-extension-system': Layers,
  'permission-modes': LockKeyhole,
  'hooks--event-automation': Webhook,
  'input-superpowers': Zap,
  'configuration-2': SlidersHorizontal,
  'file-structure-map': Network,
  'rewind--checkpoints': RotateCcw,
  'pro-workflow--how-to-get-the-best-out-of-claude-code': Crosshair,
  'create-custom-commands': Code,
  'remote-control--continue-sessions-from-any-device': Cast,
  'quick-reference--most-used-combos': List,
};
