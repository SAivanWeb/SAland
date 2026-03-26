/**
 * Утилиты для работы с гексагональной сеткой (axial-координаты, flat-top ориентация).
 * Чистые функции без состояния — можно использовать везде независимо от Vue.
 */

/**
 * Конвертирует axial-координаты гексагона (q, r) в пиксельную позицию центра.
 * @param q - горизонтальная ось (колонка)
 * @param r - диагональная ось (строка)
 * @param size - радиус гексагона в пикселях
 * @param gap - отступ между гексагонами в пикселях
 */
export function hexToPixel(
  q: number,
  r: number,
  size: number,
  gap: number,
): { x: number; y: number } {
  const s = size + gap
  const x = s * ((3 / 2) * q)
  const y = s * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r)
  return { x, y }
}
