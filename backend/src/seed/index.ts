import { lotsMock } from '../data/lots.mock';
import { loadEnv } from '../config/env';
import { logger } from '../utils/logger';
import { FinanceSettingsModel } from '../models/finance-settings.model';
import { LotModel } from '../models/lot.model';
import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/password';

const ADMIN_EMAIL = 'manu@totot.me';
const ADMIN_NAME = 'Manu';

const getDefaultAdminPassword = () => {
  const env = loadEnv();
  return env.DEFAULT_ADMIN_PASSWORD ?? 'GranDzilam2024!';
};

const ensureFinanceSettings = async () => {
  const existing = await FinanceSettingsModel.findOne();
  if (existing) {
    return existing;
  }

  const created = await FinanceSettingsModel.create({});
  logger.info('Seeding default finance settings');
  return created;
};

const ensureLots = async () => {
  const count = await LotModel.estimatedDocumentCount();
  if (count > 0) {
    return;
  }

  logger.info('Seeding default lots');
  await LotModel.insertMany(
    lotsMock.map((lot, index) => ({
      identifier: lot.id,
      superficieM2: lot.superficieM2,
      precio: lot.precio,
      estado: lot.estado,
      order: index,
    })),
  );
};

const ensureAdminUser = async () => {
  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await UserModel.findOne({ email });

  if (!existing) {
    const passwordHash = hashPassword(getDefaultAdminPassword());
    await UserModel.create({
      email,
      name: ADMIN_NAME,
      passwordHash,
      role: 'admin',
    });
    logger.info(`Default admin user created (${ADMIN_EMAIL})`);
    return;
  }

  if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    logger.info(`Existing user ${ADMIN_EMAIL} promoted to admin`);
  }
};

export const initializeSeedData = async () => {
  try {
    await ensureFinanceSettings();
  } catch (error) {
    logger.warn('Failed to ensure finance settings', error);
  }

  try {
    await ensureLots();
  } catch (error) {
    logger.warn('Failed to seed default lots', error);
  }

  try {
    await ensureAdminUser();
  } catch (error) {
    logger.warn('Failed to ensure default admin user', error);
  }
};
