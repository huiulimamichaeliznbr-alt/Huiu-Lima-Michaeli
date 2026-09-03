import { UserSubscription } from '../types';

const STORAGE_KEY = 'gerador_ia_monthly_subscription';

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planId: 'monthly-pro',
  planName: 'Plano Pro Mensal',
  pricePerMonth: 'R$ 29,90',
  status: 'active',
  billingCycle: 'mensal',
  renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  startedAt: new Date().toLocaleDateString('pt-BR'),
  paymentMethod: 'Cartão de Crédito •••• 4092 (Assinatura Ativa)',
  batchesUsed: 3,
  maxTrialBatches: 1,
  isAutoRenew: true,
};

export const subscriptionService = {
  getSubscription(): UserSubscription {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar assinatura:', e);
    }
    // Set default active monthly subscription so the user immediately experiences the monthly subscription features
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION));
    return DEFAULT_SUBSCRIPTION;
  },

  saveSubscription(sub: UserSubscription): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    } catch (e) {
      console.warn('Erro ao salvar assinatura:', e);
    }
  },

  activateMonthlyPlan(paymentMethod = 'Cartão de Crédito •••• 4092'): UserSubscription {
    const updated: UserSubscription = {
      planId: 'monthly-pro',
      planName: 'Plano Pro Mensal',
      pricePerMonth: 'R$ 29,90',
      status: 'active',
      billingCycle: 'mensal',
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      startedAt: new Date().toLocaleDateString('pt-BR'),
      paymentMethod,
      batchesUsed: 0,
      maxTrialBatches: 1,
      isAutoRenew: true,
    };
    this.saveSubscription(updated);
    return updated;
  },

  cancelSubscription(): UserSubscription {
    const current = this.getSubscription();
    const updated: UserSubscription = {
      ...current,
      status: 'expired',
      isAutoRenew: false,
    };
    this.saveSubscription(updated);
    return updated;
  },

  toggleAutoRenew(): UserSubscription {
    const current = this.getSubscription();
    const updated: UserSubscription = {
      ...current,
      isAutoRenew: !current.isAutoRenew,
    };
    this.saveSubscription(updated);
    return updated;
  },

  incrementBatchUsage(): UserSubscription {
    const current = this.getSubscription();
    const updated: UserSubscription = {
      ...current,
      batchesUsed: current.batchesUsed + 1,
    };
    this.saveSubscription(updated);
    return updated;
  },
};
