import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Calendar,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  QrCode,
  Lock,
} from 'lucide-react';
import { UserSubscription } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onActivatePlan: (paymentMethod: string) => void;
  onCancelPlan: () => void;
  onToggleAutoRenew: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onActivatePlan,
  onCancelPlan,
  onToggleAutoRenew,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4092');
  const [cardHolder, setCardHolder] = useState('USUARIO PREMIUM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const isActive = subscription.status === 'active';

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const methodLabel =
        selectedMethod === 'card'
          ? `Cartão de Crédito •••• ${cardNumber.slice(-4) || '4092'}`
          : 'Pix Mensal Automático';
      onActivatePlan(methodLabel);
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(
      '00020126580014br.gov.bcb.pix013650imagens-ia-mensal@pagamento.com520400005303986540529.905802BR5916GERADOR DE 50 IA6009SAO PAULO62070503***6304E1F8'
    );
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-outfit text-xl font-bold text-neutral-100">
                Plano de Assinatura Mensal
              </h3>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                  isActive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                {isActive ? 'PRO ATIVO' : 'ASSINATURA NECESSÁRIA'}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Gere lotes de 50 imagens 9:16 instantaneamente sem limites com cobrança mensal
            </p>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-amber-950/20 p-5 mb-5 shadow-lg">
          <div className="flex items-baseline justify-between border-b border-neutral-800/80 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Assinatura Recorrente
              </span>
              <h4 className="font-outfit text-lg font-bold text-neutral-100">
                Plano Pro Mensal 9:16
              </h4>
            </div>
            <div className="text-right">
              <span className="font-outfit text-2xl font-extrabold text-neutral-100">
                R$ 29,90
              </span>
              <span className="text-xs text-neutral-400"> / mês</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Geração <strong>instantânea</strong> de 50 fotos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Formato vertical <strong>9:16</strong> padrão Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Download em <strong>ZIP</strong> de 50 imagens</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Armazenamento local <strong>ilimitado</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Licença de uso comercial total</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Cancele quando quiser sem fidelidade</span>
            </div>
          </div>
        </div>

        {/* Current Subscription Status Details */}
        {isActive ? (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 mb-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Status da Conta:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Assinatura Mensal Ativa
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Forma de Pagamento:</span>
              <span className="font-mono text-neutral-200">{subscription.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Próxima Cobrança Mensal:</span>
              <span className="font-semibold text-neutral-200">{subscription.renewDate} (R$ 29,90)</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
              <span className="text-neutral-400">Renovação Automática:</span>
              <button
                type="button"
                onClick={onToggleAutoRenew}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  subscription.isAutoRenew
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {subscription.isAutoRenew ? 'Ativada (Mensal)' : 'Pausada'}
              </button>
            </div>

            {/* Cancel Action */}
            <div className="pt-2">
              {!showConfirmCancel ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(true)}
                  className="text-xs text-neutral-500 hover:text-red-400 underline transition-colors"
                >
                  Deseja cancelar a renovação da assinatura mensal?
                </button>
              ) : (
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3">
                  <p className="text-xs text-red-300 mb-2">
                    Ao cancelar, você não terá acesso à geração instantânea de novos lotes após o período atual.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onCancelPlan();
                        setShowConfirmCancel(false);
                      }}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                    >
                      Confirmar Cancelamento
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmCancel(false)}
                      className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Payment / Subscription Form */
          <form onSubmit={handleSimulatePayment} className="space-y-4 mb-5">
            {/* Payment Method Switcher */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Forma de Pagamento Recorrente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    selectedMethod === 'card'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Cartão de Crédito</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('pix')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    selectedMethod === 'pix'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Pix Recorrente</span>
                </button>
              </div>
            </div>

            {selectedMethod === 'card' ? (
              <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-200 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Validade
                    </label>
                    <input
                      type="text"
                      defaultValue="12/30"
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-200 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      defaultValue="888"
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-200 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
                <p className="text-xs text-neutral-300 font-medium mb-2">
                  Ativação instantânea via Pix com débito mensal recorrente:
                </p>
                <div className="mx-auto my-2 flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=00020126580014br.gov.bcb.pix013650imagens-ia-mensal"
                    alt="QR Code Pix"
                    className="h-full w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="mt-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-amber-300 hover:bg-neutral-700"
                >
                  {copiedPix ? 'Chave Copiada com Sucesso!' : 'Copiar Código Pix Copia e Cola'}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 px-4 font-outfit text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition-all disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isProcessing
                  ? 'Processando ativação mensal...'
                  : 'Assinar Plano Mensal (R$ 29,90/mês)'}
              </span>
            </button>
          </form>
        )}

        {/* Security badge & note */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Cobrança segura de R$ 29,90/mês. Cancele com 1 clique a qualquer momento.</span>
        </div>
      </div>
    </div>
  );
};
