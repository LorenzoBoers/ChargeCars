import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Chip,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Pagination,
  Select,
  SelectItem,
  Spacer,
  Divider,
  Badge,
  Tabs,
  Tab,
  Tooltip
} from "@nextui-org/react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  BanknotesIcon,
  TruckIcon,
  PhoneIcon,
  BoltIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  PencilIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

// Static data types
interface Order {
  id: string;
  date: string;
  status: string;
  reference: string;
  orderType: string;
  organization: string;
  customer: string;
  value: string;
  owner: string;
  actions: string[];
}

const OrderManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("orders");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  // Sample data
  const orders: Order[] = [
    {
      id: "1",
      date: "2025-01-15",
      status: "Nieuwe lead",
      reference: "CCS-2025-00123",
      orderType: "Residential Installation",
      organization: "Tesla Nederland",
      customer: "Jan de Vries",
      value: "€ 2.850",
      owner: "M. van der Berg",
      actions: ["view", "edit", "contact"]
    },
    {
      id: "2", 
      date: "2025-01-14",
      status: "In behandeling",
      reference: "CCS-2025-00122",
      orderType: "Business Installation",
      organization: "MKB Energy Solutions",
      customer: "Sarah Johnson",
      value: "€ 15.750",
      owner: "L. Janssen",
      actions: ["view", "edit", "schedule"]
    },
    {
      id: "3",
      date: "2025-01-13", 
      status: "Geïnstalleerd",
      reference: "CCS-2025-00121",
      orderType: "Fast Charging Hub",
      organization: "Fastned",
      customer: "Alex Chen",
      value: "€ 45.200",
      owner: "R. de Wit",
      actions: ["view", "invoice"]
    },
    {
      id: "4",
      date: "2025-01-12",
      status: "Planning", 
      reference: "CCS-2025-00120",
      orderType: "Home Charging Point",
      organization: "Private Customer",
      customer: "Emma Wilson",
      value: "€ 1.750",
      owner: "M. van der Berg",
      actions: ["view", "edit", "schedule"]
    },
    {
      id: "5",
      date: "2025-01-11",
      status: "Wacht op onderdelen",
      reference: "CCS-2025-00119", 
      orderType: "Solar + Charging Combo",
      organization: "Green Energy BV",
      customer: "Tom Anderson",
      value: "€ 8.950",
      owner: "K. Smit",
      actions: ["view", "edit", "contact"]
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors = {
      "Nieuwe lead": "primary",
      "In behandeling": "warning", 
      "Planning": "secondary",
      "Geïnstalleerd": "success",
      "Wacht op onderdelen": "default",
      "Geannuleerd": "danger"
    } as const;
    
    return statusColors[status as keyof typeof statusColors] || "default";
  };

  const renderCell = (order: Order, columnKey: React.Key) => {
    switch (columnKey) {
      case "date":
        return (
          <div className="flex flex-col py-2">
            <p className="text-sm font-medium text-white">{order.date}</p>
            <p className="text-xs text-gray-500">Order Date</p>
          </div>
        );
      case "status":
        return (
          <Chip 
            color={getStatusColor(order.status)}
            size="sm"
            variant="flat"
            className="font-medium"
          >
            {order.status}
          </Chip>
        );
      case "reference":
        return (
          <div className="flex flex-col py-2">
            <p className="text-sm font-semibold text-primary hover:text-primary/80 cursor-pointer transition-colors">
              {order.reference}
            </p>
            <p className="text-xs text-gray-400">{order.orderType}</p>
          </div>
        );
      case "customer":
        return (
          <div className="flex flex-col py-2">
            <p className="text-sm font-medium text-white">{order.customer}</p>
            <p className="text-xs text-gray-400">{order.organization}</p>
          </div>
        );
      case "value":
        return (
          <div className="py-2">
            <p className="text-sm font-semibold text-secondary">{order.value}</p>
          </div>
        );
      case "owner":
        return (
          <div className="flex items-center gap-2 py-2">
            <Avatar 
              size="sm" 
              name={order.owner} 
              className="bg-primary text-white"
            />
            <span className="text-sm text-white">{order.owner}</span>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2 py-2">
            <Tooltip content="View Order" placement="top">
              <Button 
                isIconOnly 
                size="sm" 
                variant="ghost" 
                className="text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label="View order details"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Edit Order" placement="top">
              <Button 
                isIconOnly 
                size="sm" 
                variant="ghost" 
                className="text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all duration-200"
                aria-label="Edit order"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="ghost" 
                  className="text-gray-400 hover:text-warning hover:bg-warning/10 transition-all duration-200"
                  aria-label="More actions"
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Order actions">
                <DropdownItem key="contact" startContent={<PhoneIcon className="h-4 w-4" />}>
                  Contact Customer
                </DropdownItem>
                <DropdownItem key="schedule" startContent={<CalendarDaysIcon className="h-4 w-4" />}>
                  Schedule Installation
                </DropdownItem>
                <DropdownItem key="invoice" startContent={<DocumentTextIcon className="h-4 w-4" />}>
                  Generate Invoice
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-content1 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ChargeCars</h2>
              <p className="text-xs text-gray-400">Order Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: HomeIcon, label: "Dashboard", active: false },
            { icon: ClipboardDocumentListIcon, label: "Orders", active: true },
            { icon: DocumentTextIcon, label: "Quotes", active: false },
            { icon: CalendarDaysIcon, label: "Installations", active: false },
            { icon: UserGroupIcon, label: "Customers", active: false },
            { icon: PhoneIcon, label: "Communication", active: false },
            { icon: ChartBarIcon, label: "Analytics", active: false },
            { icon: CogIcon, label: "Settings", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.active 
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-content2 hover:scale-[1.02]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-content2 transition-colors cursor-pointer">
            <Avatar 
              size="sm" 
              name="Admin User" 
              className="bg-gradient-to-br from-primary to-secondary text-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@chargecars.nl</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Metrics */}
        <div className="p-6 bg-content1 border-b border-gray-800">
          {/* Metrics Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[
              { label: "Total Orders", value: "3,905", change: "+12%", trend: "up", color: "primary", icon: ClipboardDocumentListIcon },
              { label: "Active Orders", value: "247", change: "+5%", trend: "up", color: "secondary", icon: BoltIcon },
              { label: "Monthly Revenue", value: "€2.4M", change: "+18%", trend: "up", color: "success", icon: BanknotesIcon },
              { label: "Completion Rate", value: "94%", change: "-2%", trend: "down", color: "warning", icon: ChartBarIcon }
            ].map((metric) => (
              <Card key={metric.label} className="bg-content2 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-[1.02]">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-400">{metric.label}</p>
                    </div>
                    <Chip 
                      size="sm" 
                      variant="flat"
                      color={metric.trend === "up" ? "success" : "danger"}
                      className="text-xs font-medium"
                    >
                      {metric.change}
                    </Chip>
                  </div>
                  <p className={`text-2xl font-bold text-${metric.color}`}>{metric.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Page Title & Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Order Management</h1>
              <p className="text-gray-400">Manage and track all charging station orders</p>
            </div>
            <div className="flex gap-3">
              <Button
                color="default"
                variant="bordered"
                startContent={<ArrowDownTrayIcon className="h-4 w-4" />}
                className="border-gray-600 text-gray-300 hover:bg-content2 hover:border-gray-500 transition-all duration-200"
              >
                Export
              </Button>
              <Button
                color="primary"
                startContent={<PlusIcon className="h-4 w-4" />}
                className="bg-primary hover:bg-primary/80 shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                New Order
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <Card className="bg-content1 border border-gray-800 shadow-2xl">
            <CardBody className="p-6">
              {/* Filters */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <Input
                    placeholder="Search orders..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    startContent={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
                    className="w-80"
                    classNames={{
                      input: "bg-content2 border-gray-700 text-white",
                      inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors duration-200"
                    }}
                    aria-label="Search orders by reference or customer name"
                  />
                  
                  <Select
                    placeholder="Filter by Status"
                    className="w-48"
                    classNames={{
                      trigger: "bg-content2 border-gray-700 hover:border-primary data-[open=true]:border-primary transition-colors duration-200",
                      value: "text-white"
                    }}
                    aria-label="Filter orders by status"
                  >
                    <SelectItem key="all">All Statuses</SelectItem>
                    <SelectItem key="nieuwe-lead">Nieuwe lead</SelectItem>
                    <SelectItem key="in-behandeling">In behandeling</SelectItem>
                    <SelectItem key="planning">Planning</SelectItem>
                    <SelectItem key="geinstalleerd">Geïnstalleerd</SelectItem>
                  </Select>

                  <Select
                    placeholder="Filter by Owner"
                    className="w-48"
                    classNames={{
                      trigger: "bg-content2 border-gray-700 hover:border-primary data-[open=true]:border-primary transition-colors duration-200",
                      value: "text-white"
                    }}
                    aria-label="Filter orders by owner"
                  >
                    <SelectItem key="all">All Owners</SelectItem>
                    <SelectItem key="mvdberg">M. van der Berg</SelectItem>
                    <SelectItem key="ljanssen">L. Janssen</SelectItem>
                    <SelectItem key="rdewit">R. de Wit</SelectItem>
                  </Select>
                </div>

                <Button
                  variant="bordered"
                  startContent={<FunnelIcon className="h-4 w-4" />}
                  className="border-gray-600 text-gray-300 hover:bg-content2 hover:border-gray-500 transition-all duration-200"
                >
                  More Filters
                </Button>
              </div>

              {/* Orders Table */}
              <Table 
                aria-label="Orders table with order details and actions"
                classNames={{
                  wrapper: "bg-content1 shadow-none",
                  th: "bg-content2 text-gray-300 border-b border-gray-700 font-semibold uppercase tracking-wide text-xs",
                  td: "border-b border-gray-800 py-4",
                  tbody: "[&>tr:hover]:bg-content2/50"
                }}
              >
                <TableHeader>
                  <TableColumn key="date">DATE</TableColumn>
                  <TableColumn key="status">STATUS</TableColumn>
                  <TableColumn key="reference">REFERENCE</TableColumn>
                  <TableColumn key="customer">CUSTOMER</TableColumn>
                  <TableColumn key="value">VALUE</TableColumn>
                  <TableColumn key="owner">OWNER</TableColumn>
                  <TableColumn key="actions">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody items={orders}>
                  {(order) => (
                    <TableRow 
                      key={order.id} 
                      className="hover:bg-content2/50 transition-colors duration-200 cursor-pointer"
                    >
                      {(columnKey) => (
                        <TableCell>{renderCell(order, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">1-5</span> of <span className="font-medium text-white">3,905</span> orders
                </p>
                <Pagination
                  total={781}
                  page={1}
                  className="gap-2"
                  classNames={{
                    item: "bg-content2 border-gray-700 text-gray-300 hover:bg-content3 transition-colors duration-200",
                    cursor: "bg-primary text-white shadow-lg"
                  }}
                  showControls
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement; 