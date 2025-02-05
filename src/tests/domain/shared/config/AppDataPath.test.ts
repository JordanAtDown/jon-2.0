import { describe, expect, it, vi } from 'vitest';
import AppDataPath from '../../../../domain/shared/config/AppDataPath.js';
import {
  expectLeft,
  expectRight,
} from '../../../shared/utils/test/Expected.js';

vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}));

vi.mock('path', async () => {
  const mod = await vi.importActual<typeof import('path')>('path');
  return {
    ...mod,
    join: vi.fn((...args) => args.join('/')),
  };
});

describe('AppDataPath', () => {
  describe('getAppDataPath', () => {
    it('devrait retourner le chemin appdata déjà calculé sans le recalculer', async () => {
      const instance = AppDataPath as any;
      instance.path = '/mock/path';

      const result = await instance.getAppDataPath()();

      expectRight(result, (path) => {
        expect(path).toBe('/mock/path');
      });
    });

    it('devrait retourner un chemin pour Windows si platform = win32', async () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
      process.env.LOCALAPPDATA = 'C:/Users/MockUser/AppData/Local';

      const instance = AppDataPath as any;
      instance.path = null;

      const result = await instance.getAppDataPath()();

      expectRight(result, (path) => {
        expect(path).toBe('C:/Users/MockUser/AppData/Local/jon-2.0');
      });
    });

    it('devrait retourner un chemin pour Linux si platform = linux', async () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');

      const instance = AppDataPath as any;
      instance.path = null;

      const result = await instance.getAppDataPath()();

      expectRight(result, (path) => {
        expect(path).toBe('/mock/home/.jon-2.0');
      });
    });

    it("devrait échouer si le système d'exploitation n'est pas supporté", async () => {
      vi.spyOn(process, 'platform', 'get').mockRejectedValue('unsupportedOS');

      const instance = AppDataPath as any;
      instance.path = null;

      const result = await instance.getAppDataPath()();

      expectLeft(result, (error: Error) => {
        expect(error.message).toBe(
          'Unsupported operating system: only Windows and Linux are supported.',
        );
      });
    });

    it('devrait échouer si le chemin AppData est introuvable sur Windows', async () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
      process.env.LOCALAPPDATA = '';
      process.env.APPDATA = '';

      const instance = AppDataPath as any;
      instance.path = null;

      const result = await instance.getAppDataPath()();

      expectLeft(result, (error: Error) => {
        expect(error.message).toEqual(
          'Unable to locate AppData directory on Windows.',
        );
      });
    });
  });
});
