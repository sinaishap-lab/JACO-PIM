/* JACO PIM — UI component library barrel.
   Import from "@/components/ui": import { Button, Card, Badge } from "@/components/ui"; */

// Brand
export { Logo } from "./Logo";
export type { LogoProps } from "./Logo";

// Core
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "./Card";

// Forms
export { Field, Input, Textarea, Select } from "./Field";
export type { FieldProps, InputProps, TextareaProps, SelectProps } from "./Field";
export { Switch } from "./Switch";
export type { SwitchProps } from "./Switch";
export { Checkbox, Radio } from "./Choice";
export type { CheckboxProps, RadioProps } from "./Choice";

// Data display
export { Table, THead, TBody, TR, TH, TD } from "./Table";
export { Avatar, AvatarGroup } from "./Avatar";
export type { AvatarProps } from "./Avatar";
export { Progress } from "./Progress";
export type { ProgressProps } from "./Progress";
export { Skeleton } from "./Skeleton";
export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

// Feedback & overlays
export { Alert } from "./Alert";
export type { AlertProps } from "./Alert";
export { Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";
export { Dialog, ConfirmDialog } from "./Dialog";
export type { DialogProps, ConfirmDialogProps } from "./Dialog";
export { ToastProvider, useToast } from "./Toast";
export {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "./DropdownMenu";
export type { DropdownMenuProps, DropdownItemProps } from "./DropdownMenu";

// Navigation
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
export type { TabsProps, TabsTriggerProps, TabsContentProps } from "./Tabs";
export { Breadcrumbs } from "./Breadcrumbs";
export type { Crumb } from "./Breadcrumbs";
export { Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";

// App shell
export { Sidebar, SidebarSection, SidebarItem } from "./Sidebar";
export type { SidebarItemProps } from "./Sidebar";
export { AppHeader, IconButton } from "./AppHeader";
