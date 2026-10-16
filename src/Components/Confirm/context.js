import { createContext, useContext } from 'react'

export const ConfirmContext = createContext(null)

/**
 * `const confirm = useConfirm()`, then `if (await confirm('Delete this?')) ...`.
 * Resolves true for Yes, false for No or a dismissed dialog. Options:
 * { title, confirmLabel, cancelLabel, variant }.
 */
export const useConfirm = () => {
  const confirm = useContext(ConfirmContext)

  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>')

  return confirm
}
