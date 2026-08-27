import { translate } from '../lib/i18n/translate';
import { useLocaleStore } from '../lib/i18n/localeStore';

export async function parseErrorOrThrow(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const code = body?.error?.code as string | undefined;
  const serverMessage = body?.error?.message as string | undefined;
  const locale = useLocaleStore.getState().locale;

  const errorKey = code ? `errors.${code}` : '';
  const translated = code ? translate(locale, errorKey) : undefined;
  const message =
    translated && translated !== errorKey ? translated : (serverMessage ?? translate(locale, 'common.unknownError'));

  const err = new Error(message) as Error & { code?: string };
  if (code) err.code = code;
  throw err;
}
