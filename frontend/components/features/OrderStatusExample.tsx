import React from 'react';
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider, Tabs, Tab } from "@nextui-org/react";
import StatusBadge from '@/components/ui/StatusBadge';
import { STATUS_NEW, INFO_500, WARNING_500, SUCCESS_500, DANGER_500 } from '@/lib/utils/statusColors';

// Voorbeeld data zoals het uit de database zou kunnen komen
const exampleOrders = [
  { id: 1, orderNumber: 'ORD-001', title: 'Support Ticket', status: STATUS_NEW, customer: 'Bedrijf A' },
  { id: 2, orderNumber: 'ORD-002', title: 'In Behandeling', status: INFO_500, customer: 'Bedrijf B' },
  { id: 3, orderNumber: 'ORD-003', title: 'Wacht op Klant Info', status: WARNING_500, customer: 'Bedrijf C' },
  { id: 4, orderNumber: 'ORD-004', title: 'Opgelost', status: SUCCESS_500, customer: 'Bedrijf D' },
  { id: 5, orderNumber: 'ORD-005', title: 'Afgesloten', status: SUCCESS_500, customer: 'Bedrijf E' },
  { id: 6, orderNumber: 'ORD-006', title: 'Sales Lead', status: STATUS_NEW, customer: 'Bedrijf F' },
  { id: 7, orderNumber: 'ORD-007', title: 'Geannuleerd', status: DANGER_500, customer: 'Bedrijf G' },
];

// Voorbeeld van legacy statussen die nog niet de nieuwe semantische kleurnamen gebruiken
const legacyOrders = [
  { id: 101, orderNumber: 'LEG-001', title: 'Nieuw Ticket', status: 'Nieuw', customer: 'Legacy A' },
  { id: 102, orderNumber: 'LEG-002', title: 'In Behandeling', status: 'In behandeling', customer: 'Legacy B' },
  { id: 103, orderNumber: 'LEG-003', title: 'Wachten op Klant', status: 'Wachten op klant', customer: 'Legacy C' },
  { id: 104, orderNumber: 'LEG-004', title: 'Voltooid', status: 'Voltooid', customer: 'Legacy D' },
  { id: 105, orderNumber: 'LEG-005', title: 'Geannuleerd', status: 'Geannuleerd', customer: 'Legacy E' },
];

/**
 * Voorbeeldcomponent die laat zien hoe je de StatusBadge component kunt gebruiken
 * in een tabel met orders of tickets
 */
export const OrderStatusExample: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Status Kleuren Voorbeeld</h3>
      </CardHeader>
      <CardBody>
        <Tabs aria-label="Status voorbeelden">
          <Tab key="new" title="Nieuwe Semantische Kleuren">
            <div className="py-4">
              <p className="text-sm text-foreground-600 mb-4">
                Deze voorbeelden gebruiken de nieuwe semantische kleurnamen uit de database.
              </p>
              <Table aria-label="Voorbeeld van orders met nieuwe semantische statussen">
                <TableHeader>
                  <TableColumn>ORDER #</TableColumn>
                  <TableColumn>TITEL</TableColumn>
                  <TableColumn>STATUS CODE</TableColumn>
                  <TableColumn>STATUS BADGE</TableColumn>
                  <TableColumn>KLANT</TableColumn>
                </TableHeader>
                <TableBody>
                  {exampleOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell><code>{order.status}</code></TableCell>
                      <TableCell>
                        <StatusBadge 
                          statusColor={order.status} 
                        />
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tab>
          <Tab key="legacy" title="Legacy Statussen">
            <div className="py-4">
              <p className="text-sm text-foreground-600 mb-4">
                Deze voorbeelden gebruiken legacy statussen die automatisch worden gemapt naar de juiste kleuren.
              </p>
              <Table aria-label="Voorbeeld van orders met legacy statussen">
                <TableHeader>
                  <TableColumn>ORDER #</TableColumn>
                  <TableColumn>TITEL</TableColumn>
                  <TableColumn>STATUS CODE</TableColumn>
                  <TableColumn>STATUS BADGE</TableColumn>
                  <TableColumn>KLANT</TableColumn>
                </TableHeader>
                <TableBody>
                  {legacyOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell><code>{order.status}</code></TableCell>
                      <TableCell>
                        <StatusBadge 
                          statusColor={order.status} 
                        />
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tab>
          <Tab key="variants" title="Badge Varianten">
            <div className="py-4">
              <p className="text-sm text-foreground-600 mb-4">
                De StatusBadge component ondersteunt verschillende varianten en aanpassingen.
              </p>
              
              <h4 className="text-md font-semibold mb-2">Standaard (flat)</h4>
              <div className="flex gap-2 mb-4">
                <StatusBadge statusColor={STATUS_NEW} />
                <StatusBadge statusColor={INFO_500} />
                <StatusBadge statusColor={WARNING_500} />
                <StatusBadge statusColor={SUCCESS_500} />
                <StatusBadge statusColor={DANGER_500} />
              </div>
              
              <h4 className="text-md font-semibold mb-2">Solid variant</h4>
              <div className="flex gap-2 mb-4">
                <StatusBadge statusColor={STATUS_NEW} variant="solid" />
                <StatusBadge statusColor={INFO_500} variant="solid" />
                <StatusBadge statusColor={WARNING_500} variant="solid" />
                <StatusBadge statusColor={SUCCESS_500} variant="solid" />
                <StatusBadge statusColor={DANGER_500} variant="solid" />
              </div>
              
              <h4 className="text-md font-semibold mb-2">Bordered variant</h4>
              <div className="flex gap-2 mb-4">
                <StatusBadge statusColor={STATUS_NEW} variant="bordered" />
                <StatusBadge statusColor={INFO_500} variant="bordered" />
                <StatusBadge statusColor={WARNING_500} variant="bordered" />
                <StatusBadge statusColor={SUCCESS_500} variant="bordered" />
                <StatusBadge statusColor={DANGER_500} variant="bordered" />
              </div>
              
              <h4 className="text-md font-semibold mb-2">Aangepaste labels</h4>
              <div className="flex gap-2 mb-4">
                <StatusBadge statusColor={STATUS_NEW} label="Aangepast label" />
                <StatusBadge statusColor={SUCCESS_500} label="Klaar voor verzending" />
              </div>
              
              <h4 className="text-md font-semibold mb-2">Verschillende groottes</h4>
              <div className="flex items-center gap-2">
                <StatusBadge statusColor={INFO_500} size="sm" />
                <StatusBadge statusColor={INFO_500} size="md" />
                <StatusBadge statusColor={INFO_500} size="lg" />
              </div>
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default OrderStatusExample; 