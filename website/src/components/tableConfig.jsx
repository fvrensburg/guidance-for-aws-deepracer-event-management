import {
  Box,
  Button,
  CollectionPreferences,
  Header,
  Pagination,
  SpaceBetween,
} from '@cloudscape-design/components';
import dayjs from 'dayjs';
import { default as React } from 'react';
import i18next from '../i18n';

// day.js
var advancedFormat = require('dayjs/plugin/advancedFormat');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export function EmptyState({ title, subtitle, action }) {
  return (
    <Box textAlign="center" color="inherit">
      <Box variant="strong" textAlign="center" color="inherit">
        {title}
      </Box>
      <Box variant="p" padding={{ bottom: 's' }} color="inherit">
        {subtitle}
      </Box>
      {action}
    </Box>
  );
}

export function MatchesCountText(count) {
  return count === 1 ? `1 ${i18next.t('table.match')}` : `${count} ${i18next.t('table.matches')}`;
}

export const DefaultPreferences = {
  pageSize: 20,
  wrapLines: false,
};

export function PageSizePreference(label = 'items') {
  const pageSize = {
    title: i18next.t('table.select-page-size'),
    options: [
      { value: 10, label: `10 ${label}` },
      { value: 20, label: `20 ${label}` },
      { value: 30, label: `30 ${label}` },
      { value: 50, label: `50 ${label}` },
    ],
  };
  return pageSize;
}

export const WrapLines = () => {
  return {
    label: i18next.t('table.wrap-lines'),
    description: i18next.t('table.wrap-lines-description'),
  };
};

export function CarColumnsConfig() {
  const rowHeaders = [
    {
      id: 'instanceId',
      header: i18next.t('cars.instance'),
      cell: (item) => item.InstanceId,
      sortingField: 'key',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'carName',
      header: i18next.t('cars.host-name'),
      cell: (item) => item.ComputerName || '-',
      sortingField: 'carName',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'fleetName',
      header: i18next.t('cars.fleet-name'),
      cell: (item) => item.fleetName || '-',
      sortingField: 'fleetName',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'carIp',
      header: i18next.t('cars.car-ip'),
      cell: (item) => item.IpAddress || '-',
      sortingField: 'carIp',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'agentVersion',
      header: i18next.t('cars.agent-version'),
      cell: (item) => item.AgentVersion || '-',
      sortingField: 'agentVersion',
    },
    {
      id: 'registrationDate',
      header: i18next.t('cars.registration-date'),
      cell: (item) => dayjs(item.RegistrationDate).format('YYYY-MM-DD HH:mm:ss (z)') || '-',
      sortingField: 'registrationDate',
    },
    {
      id: 'lastPingDateTime',
      header: i18next.t('cars.last-ping-time'),
      cell: (item) => dayjs(item.lastPingDateTime).format('YYYY-MM-DD HH:mm:ss (z)') || '-',
      sortingField: 'lastPingDateTime',
    },
    {
      id: 'fleetId',
      header: i18next.t('cars.fleet-id'),
      cell: (item) => item.fleetId || '-',
      sortingField: 'fleetId',
    },
  ];
  return rowHeaders;
}

export function CarVisibleContentOptions() {
  const rowHeaders = [
    {
      label: i18next.t('cars.car-information'),
      options: [
        {
          id: 'instanceId',
          label: i18next.t('cars.instance'),
          editable: true,
        },
        {
          id: 'carName',
          label: i18next.t('cars.host-name'),
          editable: false,
        },
        {
          id: 'fleetName',
          label: i18next.t('cars.fleet-name'),
          editable: true,
        },
        {
          id: 'carIp',
          label: i18next.t('cars.car-ip'),
        },
        {
          id: 'agentVersion',
          label: i18next.t('cars.agent-version'),
        },
        {
          id: 'registrationDate',
          label: i18next.t('cars.registration-date'),
        },
        {
          id: 'lastPingDateTime',
          label: i18next.t('cars.last-ping-time'),
        },
        {
          id: 'fleetId',
          label: i18next.t('cars.fleet-id'),
        },
      ],
    },
  ];
  return rowHeaders;
}

export function UserModelsColumnsConfig() {
  const rowHeaders = [
    {
      id: 'id',
      header: 'id',
      cell: (item) => item.id,
      width: 200,
      minWidth: 150,
    },
    {
      id: 'modelName',
      header: i18next.t('models.model-name'),
      cell: (item) => item.modelName || '-',
      sortingField: 'modelName',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'modelDate',
      header: i18next.t('models.upload-date'),
      cell: (item) => item.modelDate || '-',
      sortingField: 'modelDate',
      width: 200,
      minWidth: 150,
    },
  ];
  return rowHeaders;
}

export function AdminModelsColumnsConfig() {
  const rowHeaders = [
    {
      id: 'id',
      header: 'id',
      cell: (item) => item.id,
      width: 200,
      minWidth: 150,
    },
    {
      id: 'userName',
      header: i18next.t('models.user-name'),
      cell: (item) => item.userName || '-',
      sortingField: 'userName',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'modelName',
      header: i18next.t('models.model-name'),
      cell: (item) => item.modelName || '-',
      sortingField: 'modelName',
      width: 200,
      minWidth: 150,
    },
    {
      id: 'modelDate',
      header: i18next.t('models.upload-date'),
      cell: (item) => item.modelDate || '-',
      sortingField: 'modelDate',
      width: 200,
      minWidth: 150,
    },
  ];
  return rowHeaders;
}

const ItemsCount = ({ nrSelectedItems, nrTotalItems }) => {
  if (nrSelectedItems > 0) {
    return `(${nrSelectedItems}/${nrTotalItems})`;
  }
  return `(${nrTotalItems})`;
};

const HeaderActions = ({ onEdit, onDelete, onAdd, nrSelectedItems }) => {
  const disableEditButton = nrSelectedItems === 0 || nrSelectedItems > 1;
  const disableDeleteButton = nrSelectedItems === 0;
  return (
    <SpaceBetween direction="horizontal" size="xs">
      {onEdit && (
        <Button disabled={disableEditButton} onClick={onEdit}>
          {i18next.t('button.edit')}
        </Button>
      )}
      {onDelete && (
        <Button disabled={disableDeleteButton} onClick={onDelete}>
          {i18next.t('button.delete')}
        </Button>
      )}
      {onAdd && (
        <Button variant="primary" onClick={onAdd}>
          {i18next.t('button.create')}
        </Button>
      )}
    </SpaceBetween>
  );
};

export const TableHeader = ({
  onEdit,
  onDelete,
  onAdd,
  nrSelectedItems,
  nrTotalItems,
  header,
  actions = undefined,
}) => {
  return (
    <Header
      actions={
        actions ? (
          actions
        ) : (
          <HeaderActions
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            nrSelectedItems={nrSelectedItems}
          />
        )
      }
      counter={<ItemsCount nrTotalItems={nrTotalItems} nrSelectedItems={nrSelectedItems} />}
    >
      {header}
    </Header>
  );
};

export const TablePreferences = ({ preferences, setPreferences, contentOptions }) => {
  const wrapLines = WrapLines();
  return (
    <CollectionPreferences
      title={i18next.t('table.preferences')}
      confirmLabel={i18next.t('button.confirm')}
      cancelLabel={i18next.t('button.cancel')}
      onConfirm={({ detail }) => setPreferences(detail)}
      preferences={preferences}
      pageSizePreference={PageSizePreference()}
      visibleContentPreference={{
        title: i18next.t('table.select-visible-colunms'),
        options: contentOptions,
      }}
      wrapLinesPreference={wrapLines}
    />
  );
};

export const TablePagination = ({ paginationProps }) => {
  return (
    <Pagination
      {...paginationProps}
      ariaLabels={{
        nextPageLabel: i18next.t('table.next-page'),
        previousPageLabel: i18next.t('table.previous-page'),
        pageLabel: (pageNumber) => `$(t{'table.go-to-page')} ${pageNumber}`,
      }}
    />
  );
};