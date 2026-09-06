/**
 * Icons.jsx — Enterprise Bootstrap Icon System
 * Powered by react-bootstrap-icons & bootstrap-icons
 */
import {
  PeopleFill,
  Building,
  CashCoin,
  Megaphone,
  PersonBadge,
  Cpu,
  ShieldLock,
  Key,
  Search,
  PlusLg,
  PencilSquare,
  Trash3,
  BoxArrowRight,
  SunFill,
  MoonFill,
  Palette,
  LightningChargeFill,
  ChatDots,
  CheckLg,
  XLg,
  Funnel,
  List,
  FileEarmarkText,
  Book,
  Clipboard,
  ClipboardCheck,
  HandThumbsUp,
  HandThumbsDown,
  GearFill,
  ExclamationTriangleFill,
  ExclamationCircleFill,
  ArrowRight,
  SendFill,
} from 'react-bootstrap-icons';

export function IconUsers({ size = 18, className = '', ...props }) {
  return <PeopleFill size={size} className={className} {...props} />;
}

export function IconBuilding({ size = 18, className = '', ...props }) {
  return <Building size={size} className={className} {...props} />;
}

export function IconFinance({ size = 18, className = '', ...props }) {
  return <CashCoin size={size} className={className} {...props} />;
}

export function IconMarketing({ size = 18, className = '', ...props }) {
  return <Megaphone size={size} className={className} {...props} />;
}

export function IconHR({ size = 18, className = '', ...props }) {
  return <PersonBadge size={size} className={className} {...props} />;
}

export function IconEngineering({ size = 18, className = '', ...props }) {
  return <Cpu size={size} className={className} {...props} />;
}

export function IconShield({ size = 18, className = '', ...props }) {
  return <ShieldLock size={size} className={className} {...props} />;
}

export function IconKey({ size = 18, className = '', ...props }) {
  return <Key size={size} className={className} {...props} />;
}

export function IconSearch({ size = 16, className = '', ...props }) {
  return <Search size={size} className={className} {...props} />;
}

export function IconPlus({ size = 16, className = '', ...props }) {
  return <PlusLg size={size} className={className} {...props} />;
}

export function IconEdit({ size = 15, className = '', ...props }) {
  return <PencilSquare size={size} className={className} {...props} />;
}

export function IconTrash({ size = 15, className = '', ...props }) {
  return <Trash3 size={size} className={className} {...props} />;
}

export function IconLogOut({ size = 16, className = '', ...props }) {
  return <BoxArrowRight size={size} className={className} {...props} />;
}

export function IconSun({ size = 15, className = '', ...props }) {
  return <SunFill size={size} className={className} {...props} />;
}

export function IconMoon({ size = 15, className = '', ...props }) {
  return <MoonFill size={size} className={className} {...props} />;
}

export function IconPalette({ size = 16, className = '', ...props }) {
  return <Palette size={size} className={className} {...props} />;
}

export function IconSparkles({ size = 18, className = '', ...props }) {
  return <LightningChargeFill size={size} className={className} {...props} />;
}

export function IconMessageSquare({ size = 18, className = '', ...props }) {
  return <ChatDots size={size} className={className} {...props} />;
}

export function IconCheck({ size = 16, className = '', ...props }) {
  return <CheckLg size={size} className={className} {...props} />;
}

export function IconX({ size = 16, className = '', ...props }) {
  return <XLg size={size} className={className} {...props} />;
}

export function IconFilter({ size = 15, className = '', ...props }) {
  return <Funnel size={size} className={className} {...props} />;
}

export function IconList({ size = 18, className = '', ...props }) {
  return <List size={size} className={className} {...props} />;
}

export function IconFileText({ size = 16, className = '', ...props }) {
  return <FileEarmarkText size={size} className={className} {...props} />;
}

export function IconBook({ size = 16, className = '', ...props }) {
  return <Book size={size} className={className} {...props} />;
}

export function IconCopy({ size = 15, className = '', ...props }) {
  return <Clipboard size={size} className={className} {...props} />;
}

export function IconClipboardCheck({ size = 15, className = '', ...props }) {
  return <ClipboardCheck size={size} className={className} {...props} />;
}

export function IconThumbsUp({ size = 15, className = '', ...props }) {
  return <HandThumbsUp size={size} className={className} {...props} />;
}

export function IconThumbsDown({ size = 15, className = '', ...props }) {
  return <HandThumbsDown size={size} className={className} {...props} />;
}

export function IconSettings({ size = 18, className = '', ...props }) {
  return <GearFill size={size} className={className} {...props} />;
}

export function IconAlertTriangle({ size = 16, className = '', ...props }) {
  return <ExclamationTriangleFill size={size} className={className} {...props} />;
}

export function IconAlertCircle({ size = 16, className = '', ...props }) {
  return <ExclamationCircleFill size={size} className={className} {...props} />;
}

export function IconArrowRight({ size = 16, className = '', ...props }) {
  return <ArrowRight size={size} className={className} {...props} />;
}

export function IconSend({ size = 16, className = '', ...props }) {
  return <SendFill size={size} className={className} {...props} />;
}

export function getDepartmentIcon(deptKey, size = 18, className = '') {
  const key = (deptKey || '').toLowerCase();
  if (key.includes('finance') || key.includes('budget') || key.includes('revenue')) {
    return <IconFinance size={size} className={className} />;
  }
  if (key.includes('market') || key.includes('sales') || key.includes('growth')) {
    return <IconMarketing size={size} className={className} />;
  }
  if (key.includes('hr') || key.includes('people') || key.includes('talent')) {
    return <IconHR size={size} className={className} />;
  }
  if (key.includes('engineer') || key.includes('tech') || key.includes('dev')) {
    return <IconEngineering size={size} className={className} />;
  }
  if (key.includes('root') || key.includes('admin') || key.includes('exec')) {
    return <IconShield size={size} className={className} />;
  }
  return <IconBuilding size={size} className={className} />;
}
