// @ts-strict-ignore
import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ButtonWithLoading } from '@actual-app/components/button';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';

import { send } from 'loot-core/platform/client/fetch';
import { getSecretsError } from 'loot-core/shared/errors';

import { type Modal as ModalType } from '../../modals/modalsSlice';
import { Error } from '../alerts';
import { Link } from '../common/Link';
import {
  Modal,
  ModalButtons,
  ModalCloseButton,
  ModalHeader,
} from '../common/Modal';
import { FormField, FormLabel } from '../forms';

type GoCardlessInitialiseModalProps = Extract<
  ModalType,
  { name: 'gocardless-init' }
>['options'];

export const GoCardlessInitialiseModal = ({
  onSuccess,
}: GoCardlessInitialiseModalProps) => {
  const { t } = useTranslation();
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(
    t('It is required to provide both the secret id and secret key.'),
  );

  const onSubmit = async (close: () => void) => {
    if (!secretId || !secretKey) {
      setIsValid(false);
      setError(
        t('It is required to provide both the secret id and secret key.'),
      );
      return;
    }

    setIsLoading(true);

    let { error, reason } =
      (await send('secret-set', {
        name: 'gocardless_secretId',
        value: secretId,
      })) || {};

    if (error) {
      setIsLoading(false);
      setIsValid(false);
      setError(getSecretsError(error, reason));
      return;
    } else {
      ({ error, reason } =
        (await send('secret-set', {
          name: 'gocardless_secretKey',
          value: secretKey,
        })) || {});
      if (error) {
        setIsLoading(false);
        setIsValid(false);
        setError(getSecretsError(error, reason));
        return;
      }
    }

    setIsValid(true);
    onSuccess();
    setIsLoading(false);
    close();
  };

  return (
    <Modal name="gocardless-init" containerProps={{ style: { width: '30vw' } }}>
      {({ state: { close } }) => (
        <>
          <ModalHeader
            title={t('Set up GoCardless')}
            rightContent={<ModalCloseButton onPress={close} />}
          />
          <View style={{ display: 'flex', gap: 10 }}>
            <Text>
              <Trans>
                In order to enable bank sync via GoCardless (only for EU banks)
                you will need to create access credentials. This can be done by
                creating an account with{' '}
                <Link
                  variant="external"
                  to="https://actualbudget.org/docs/advanced/bank-sync/"
                  linkColor="purple"
                >
                  GoCardless
                </Link>
                .
              </Trans>
            </Text>

            <FormField>
              <FormLabel title={t('Secret ID:')} htmlFor="secret-id-field" />
              <InitialFocus>
                <Input
                  id="secret-id-field"
                  type="password"
                  value={secretId}
                  onChangeValue={value => {
                    setSecretId(value);
                    setIsValid(true);
                  }}
                />
              </InitialFocus>
            </FormField>

            <FormField>
              <FormLabel title={t('Secret Key:')} htmlFor="secret-key-field" />
              <Input
                id="secret-key-field"
                type="password"
                value={secretKey}
                onChangeValue={value => {
                  setSecretKey(value);
                  setIsValid(true);
                }}
              />
            </FormField>

            {!isValid && <Error>{error}</Error>}
          </View>

          <ModalButtons>
            <ButtonWithLoading
              variant="primary"
              isLoading={isLoading}
              onPress={() => {
                onSubmit(close);
              }}
            >
              <Trans>Save and continue</Trans>
            </ButtonWithLoading>
          </ModalButtons>
        </>
      )}
    </Modal>
  );
};
