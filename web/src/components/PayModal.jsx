import React, { useState } from 'react';
import { api, saveToken } from '../lib/api.js';

/**
 * 模拟支付弹窗（占位）：
 * 创建订单 → 点确认"支付" → 获得解锁令牌并写入 localStorage。
 */
export default function PayModal({ type, onClose, onPaid }) {
  const [step, setStep] = useState('confirm'); // confirm | paying | done
  const [order, setOrder] = useState(null);

  const doPay = async () => {
    setStep('paying');
    try {
      const o = order || (await api.payCreate(type));
      if (!order) setOrder(o);
      // 模拟支付通道耗时
      await new Promise((r) => setTimeout(r, 1400));
      const result = await api.payConfirm(o.orderId, type);
      saveToken(type, result.token);
      setStep('done');
      setTimeout(() => onPaid?.(), 900);
    } catch {
      setStep('confirm');
      alert('支付异常，请重试');
    }
  };

  return (
    <div className="modal" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,8,40,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="glass modal" onClick={(e) => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <h3>解锁完整命盘报告</h3>
            <div className="price"><small>￥</small>9.9</div>
            <p className="desc">
              性格底色 · 爱情婚姻详批 · 事业财运 · 健康提醒 · 2026 流年提示 · 开运建议
              <br />
              一次解锁，永久回看 · 当前为演示支付，确认即到账
            </p>
            <div className="actions">
              <button className="btn btn-gold" onClick={doPay}>立即解锁</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>再想想</button>
            </div>
          </>
        )}
        {step === 'paying' && (
          <div style={{ padding: '30px 0' }}>
            <div style={{ fontSize: 42, marginBottom: 16 }}>🔮</div>
            <p style={{ color: 'var(--text-mid)', letterSpacing: 2 }}>正在唤起星辉支付通道<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
          </div>
        )}
        {step === 'done' && (
          <div style={{ padding: '18px 0' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🌟</div>
            <h3>解锁成功</h3>
            <p className="desc" style={{ marginTop: 10 }}>命盘的全部星光，正在为你展开…</p>
          </div>
        )}
      </div>
    </div>
  );
}
