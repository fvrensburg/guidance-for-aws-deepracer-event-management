import { Auth, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { DeleteModelModal } from './components/deleteModelModal';
import { ModelsTable } from './components/modelsTable';

import { SpaceBetween } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '../../components/pageLayout';

import { formatAwsDateTime } from '../../support-functions/time';
import { ModelUpload } from './components/modelUpload';

export const ModelMangement = () => {
  const { t } = useTranslation();

  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          const username = user.username;
          const s3Path = username + '/models';
          Storage.list(s3Path, { level: 'private', pageSize: 200 }).then((models) => {
            if (models !== undefined) {
              var userModels = models.results.map(function (model) {
                const modelKeyPieces = model.key.split('/');
                return {
                  key: model.key,
                  modelName: modelKeyPieces[modelKeyPieces.length - 1],
                  modelDate: formatAwsDateTime(model.lastModified),
                };
              });
              setModels(userModels);
              setIsLoading(false);
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    getData();

    return () => {
      // Unmounting
    };
  }, []);

  const removeModelHandler = (key) => {
    setModels((items) => items.filter((items) => items.key !== key));
    setSelectedModels((items) => items.filter((items) => items.key !== key));
  };

  const addModelHandler = (newItem) => {
    setModels((items) => {
      const index = items.findIndex((item) => item.key === newItem.key);
      console.info(index);
      if (index > -1) {
        const updatedItems = [...items];
        updatedItems[newItem.key] = newItem;
        return updatedItems;
      } else {
        return [...items, newItem];
      }
    });
  };

  const actionButtons = (
    <SpaceBetween direction="horizontal" size="xs">
      <ModelUpload addModel={addModelHandler} />
      <DeleteModelModal
        disabled={selectedModels.length === 0}
        selectedModels={selectedModels}
        removeModel={removeModelHandler}
        variant="primary"
      />
    </SpaceBetween>
  );

  return (
    <PageLayout
      header={t('models.header')}
      breadcrumbs={[{ text: t('home.breadcrumb'), href: '/' }, { text: t('models.breadcrumb') }]}
    >
      <ModelsTable
        isLoading={isLoading}
        models={models}
        setSelectedModels={setSelectedModels}
        selectedModels={selectedModels}
        actionButtons={actionButtons}
      />
    </PageLayout>
  );
};