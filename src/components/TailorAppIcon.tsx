import React from 'react';
import { appIconSvg, appPorChave, type TailorApp } from '../apps';

export type TailorAppIconProps = {
  /** Id do app (`pilot`) ou a chave de produto (`gpt`). Chave desconhecida não renderiza. */
  app: string;
  /** Lado em px. Fibonacci: 21, 34, 55. */
  size?: number;
  className?: string;
};

/** O ícone do app (o mesmo do favicon) como imagem: não depende de arquivo no `public/` do app. */
export const TailorAppIcon: React.FC<TailorAppIconProps> = ({ app, size = 34, className }) => {
  const a: TailorApp | undefined = appPorChave(app);
  if (!a) return null;
  return (
    <img
      src={`data:image/svg+xml,${encodeURIComponent(appIconSvg(a))}`}
      alt={a.nome}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
};
