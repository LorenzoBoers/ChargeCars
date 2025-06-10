import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Chip,
  DateRangePicker,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress
} from '@nextui-org/react';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedEntity, setSelectedEntity] = useState('all');

  // Mock data for charts and statistics
  const stats = {
    totalRevenue: 285420,
    totalOrders: 147,
    conversionRate: 23.5,
    averageOrderValue: 1942,
    activeCustomers: 89,
    newCustomers: 23
  };

  const monthlyData = [
    { month: 'Jan', revenue: 45000, orders: 28, customers: 45 },
    { month: 'Feb', revenue: 52000, orders: 31, customers: 52 },
    { month: 'Mar', revenue: 48000, orders: 29, customers: 49 },
    { month: 'Apr', revenue: 61000, orders: 35, customers: 58 },
    { month: 'Mei', revenue: 58000, orders: 33, customers: 61 },
    { month: 'Jun', revenue: 67000, orders: 38, customers: 67 }
  ];

  const productPerformance = [
    { name: 'Wallbox Pulsar Plus', sold: 45, revenue: 89500, growth: 12.5 },
    { name: 'Alfen Eve Single', sold: 32, revenue: 64000, growth: 8.3 },
    { name: 'Easee Home', sold: 28, revenue: 42000, growth: -2.1 },
    { name: 'KEBA KeContact P30', sold: 22, revenue: 55000, growth: 15.2 },
    { name: 'Zaptec Go', sold: 20, revenue: 35000, growth: 5.7 }
  ];

  const customerSegments = [
    { segment: 'Particulier', percentage: 45, count: 67, revenue: 125000 },
    { segment: 'Zakelijk - MKB', percentage: 35, count: 52, revenue: 98000 },
    { segment: 'Zakelijk - Enterprise', percentage: 20, count: 28, revenue: 112000 }
  ];

  const businessEntities = [
    { id: 'all', name: 'Alle Entiteiten' },
    { id: 'chargecars', name: 'ChargeCars' },
    { id: 'laderthuis', name: 'LaderThuis' },
    { id: 'meterkastthuis', name: 'MeterKastThuis' },
    { id: 'zaptecshop', name: 'ZaptecShop' },
    { id: 'ratioshop', name: 'RatioShop' }
  ];

  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Laatste 7 dagen' },
    { value: 'last_30_days', label: 'Laatste 30 dagen' },
    { value: 'last_3_months', label: 'Laatste 3 maanden' },
    { value: 'last_6_months', label: 'Laatste 6 maanden' },
    { value: 'last_year', label: 'Laatste jaar' },
    { value: 'custom', label: 'Aangepast' }
  ];

  const exportData = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // In real app, this would trigger actual export
  };

  const StatCard = ({ title, value, change, icon: Icon, format = 'number' }: any) => (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">
              {format === 'currency' ? `€${value.toLocaleString()}` : 
               format === 'percentage' ? `${value}%` : 
               value.toLocaleString()}
            </p>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
        {change && (
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-danger mr-1" />
            )}
            <span className={`text-sm ${change > 0 ? 'text-success' : 'text-danger'}`}>
              {change > 0 ? '+' : ''}{change}% t.o.v. vorige periode
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const SimpleBarChart = ({ data, title }: any) => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardBody>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary rounded-t-lg mb-2"
                style={{ 
                  height: `${(item.revenue / Math.max(...data.map((d: any) => d.revenue))) * 200}px`,
                  minHeight: '20px'
                }}
              />
              <span className="text-xs text-foreground-600">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-foreground-500">Omzet per maand (€)</p>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-content1 border-b border-divider p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics & Rapportages</h1>
              <p className="text-foreground-600 mt-1">
                Inzichten in prestaties en trends
              </p>
            </div>

            {/* Export Button */}
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  color="primary" 
                  startContent={<ArrowDownTrayIcon className="h-4 w-4" />}
                >
                  Exporteren
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Export options">
                <DropdownItem 
                  key="pdf"
                  onPress={() => exportData('pdf')}
                >
                  📄 PDF Rapport
                </DropdownItem>
                <DropdownItem 
                  key="excel"
                  onPress={() => exportData('excel')}
                >
                  📊 Excel Bestand
                </DropdownItem>
                <DropdownItem 
                  key="csv"
                  onPress={() => exportData('csv')}
                >
                  📋 CSV Export
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-6">
            <Select
              placeholder="Selecteer periode"
              selectedKeys={[dateRange]}
              onSelectionChange={(keys) => setDateRange(Array.from(keys)[0] as string)}
              className="w-64"
              startContent={<CalendarDaysIcon className="h-4 w-4" />}
            >
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Selecteer entiteit"
              selectedKeys={[selectedEntity]}
              onSelectionChange={(keys) => setSelectedEntity(Array.from(keys)[0] as string)}
              className="w-64"
              startContent={<FunnelIcon className="h-4 w-4" />}
            >
              {businessEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            variant="underlined"
            className="mb-6"
          >
            <Tab
              key="overview"
              title={
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Overzicht
                </div>
              }
            >
              <div className="space-y-6">
                {/* Key Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Totale Omzet"
                    value={stats.totalRevenue}
                    change={12.5}
                    icon={CurrencyEuroIcon}
                    format="currency"
                  />
                  <StatCard
                    title="Aantal Orders"
                    value={stats.totalOrders}
                    change={8.3}
                    icon={ClockIcon}
                  />
                  <StatCard
                    title="Conversie Ratio"
                    value={stats.conversionRate}
                    change={-2.1}
                    icon={ArrowTrendingUpIcon}
                    format="percentage"
                  />
                  <StatCard
                    title="Gemiddelde Order Waarde"
                    value={stats.averageOrderValue}
                    change={5.7}
                    icon={CurrencyEuroIcon}
                    format="currency"
                  />
                  <StatCard
                    title="Actieve Klanten"
                    value={stats.activeCustomers}
                    change={15.2}
                    icon={UserGroupIcon}
                  />
                  <StatCard
                    title="Nieuwe Klanten"
                    value={stats.newCustomers}
                    change={22.8}
                    icon={UserGroupIcon}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleBarChart data={monthlyData} title="Omzet Ontwikkeling" />
                  
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Klant Segmenten</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {customerSegments.map((segment, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{segment.segment}</span>
                              <span className="text-sm text-foreground-600">
                                {segment.percentage}% ({segment.count} klanten)
                              </span>
                            </div>
                            <Progress 
                              value={segment.percentage} 
                              className="mb-1"
                              color="primary"
                            />
                            <div className="text-xs text-foreground-500">
                              €{segment.revenue.toLocaleString()} omzet
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Product Performance */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Product Prestaties</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-divider">
                            <th className="text-left py-3 px-2">Product</th>
                            <th className="text-right py-3 px-2">Verkocht</th>
                            <th className="text-right py-3 px-2">Omzet</th>
                            <th className="text-right py-3 px-2">Groei</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productPerformance.map((product, index) => (
                            <tr key={index} className="border-b border-divider last:border-b-0">
                              <td className="py-3 px-2 font-medium">{product.name}</td>
                              <td className="py-3 px-2 text-right">{product.sold}</td>
                              <td className="py-3 px-2 text-right">€{product.revenue.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right">
                                <Chip
                                  size="sm"
                                  color={product.growth > 0 ? 'success' : 'danger'}
                                  variant="flat"
                                >
                                  {product.growth > 0 ? '+' : ''}{product.growth}%
                                </Chip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab
              key="sales"
              title={
                <div className="flex items-center gap-2">
                  <CurrencyEuroIcon className="h-4 w-4" />
                  Verkoop
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <CurrencyEuroIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Verkoop Analytics</h3>
                  <p className="text-foreground-400">Gedetailleerde verkoop analytics komen binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="customers"
              title={
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4" />
                  Klanten
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <UserGroupIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Klant Analytics</h3>
                  <p className="text-foreground-400">Klant insights en gedrag analytics komen binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="operations"
              title={
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Operaties
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <ClockIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Operationele Analytics</h3>
                  <p className="text-foreground-400">Team efficiency en operationele metrics komen binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
} 