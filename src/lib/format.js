const moneyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

/** 480 -> '$480.00' */
export const formatMoney = (n) => moneyFormatter.format(Number(n) || 0)
