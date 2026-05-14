// Productfoto-mapping. Per productnaam een passende Unsplash-foto.
// Als de naam niet matcht, valt hij terug op een categorie-foto.
// Als die ook niet matcht, return null → component toont emoji fallback.

const SPECIFIC: Record<string, string> = {
  // Laptops
  'Apple MacBook Pro 13" (2020)':       'photo-1517336714731-489689fd1ca8',
  'Dell XPS 13 (2021)':                 'photo-1593642632559-0c6d3fc62b89',
  'Lenovo ThinkPad X1 Carbon Gen 9':    'photo-1496181133206-80ce9b88a853',
  'HP Spectre x360 14"':                'photo-1588872657578-7efd1f1555ed',
  'Asus ZenBook 14':                    'photo-1611186871348-b1ce696e52c9',

  // Smartphones
  'Apple iPhone 13 128 GB':             'photo-1632661674596-df8be070a5c5',
  'Apple iPhone 12 64 GB':              'photo-1605236453806-6ff36851218e',
  'Samsung Galaxy S22 256 GB':          'photo-1644501635454-2a09be1c54ab',
  'Samsung Galaxy A53 5G':              'photo-1610945265064-0e34e5519bbf',
  'Google Pixel 7 128 GB':              'photo-1666867875299-cb3e3b3e0bdd',
  'OnePlus 10 Pro 256 GB':              'photo-1598327105666-5b89351aff97',

  // Tablets
  'Apple iPad Air 5e generatie 64 GB WiFi': 'photo-1561154464-82e9adf32764',
  'Apple iPad 9e generatie 64 GB WiFi':     'photo-1544244015-0df4b3ffc6b0',
  'Samsung Galaxy Tab S8 128 GB':           'photo-1623126908029-58cb08a2b272',
  'Lenovo Tab P11 Pro':                     'photo-1585790050230-5dd28404ccb9',

  // Audio
  'Sony WH-1000XM4':                    'photo-1545127398-14699f92334b',
  'Apple AirPods Pro (2e gen)':         'photo-1572569511254-d8f925fe2cbb',
  'Bose QuietComfort 45':               'photo-1583394838336-acd977736f90',
  'JBL Charge 5':                       'photo-1608043152269-423dbba4e7e1',
  'Samsung Galaxy Buds2 Pro':           'photo-1606220588913-b3aacb4d2f46',

  // Gaming
  'Nintendo Switch OLED':               'photo-1578303512597-81e6cc155b3e',
  'PlayStation 4 Pro 1 TB':             'photo-1606144042614-b2417e99c4e3',
  'Xbox Series S 512 GB':               'photo-1621259182978-fbf93132d53d',
  'SteelSeries Arctis 7 Wireless':      'photo-1599669454699-248893623440',
  'Logitech G Pro X Superlight':        'photo-1527864550417-7fd91fc51a46',

  // Randapparatuur
  'LG 27" 4K USB-C monitor':            'photo-1527443224154-c4a3942d3acf',
  'Dell UltraSharp 24" QHD':            'photo-1547119957-637f8679db1e',
  'Logitech MX Keys Mini':              'photo-1587829741301-dc798b83add3',
  'Apple Magic Mouse (Space Gray)':     'photo-1527814050087-3793815479db',
  'Anker USB-C Hub 7-in-1':             'photo-1625948515291-69613efd103f',

  // Opladers & kabels
  'Apple 20W USB-C Power Adapter':      'photo-1583863788434-e58a36330cf0',
  'Anker 65W GaN USB-C oplader (2 poorten)': 'photo-1606293928250-1efef4e51e98',
  'Baseus 100W USB-C naar USB-C kabel (2 m)': 'photo-1601524909162-ae8725290836',
  'Samsung 25W USB-C oplader':          'photo-1583863788434-e58a36330cf0',
}

const CATEGORY_FALLBACK: { match: RegExp; id: string }[] = [
  { match: /macbook|laptop|thinkpad|zenbook|spectre|xps/i, id: 'photo-1496181133206-80ce9b88a853' },
  { match: /iphone|galaxy s|pixel|oneplus|smartphone/i,    id: 'photo-1592750475338-74b7b21085ab' },
  { match: /ipad|tab\b|tablet/i,                            id: 'photo-1561154464-82e9adf32764' },
  { match: /airpods|buds|headphone|koptelefoon|wh-|qc|arctis/i, id: 'photo-1505740420928-5e560c06d30e' },
  { match: /speaker|jbl|charge 5/i,                         id: 'photo-1608043152269-423dbba4e7e1' },
  { match: /switch|playstation|xbox|gaming|console/i,       id: 'photo-1606144042614-b2417e99c4e3' },
  { match: /monitor|ultrasharp|display/i,                   id: 'photo-1527443224154-c4a3942d3acf' },
  { match: /muis|mouse|magic mouse/i,                       id: 'photo-1527814050087-3793815479db' },
  { match: /toetsenbord|keyboard|keys/i,                    id: 'photo-1587829741301-dc798b83add3' },
  { match: /oplader|adapter|power|charger/i,                id: 'photo-1606293928250-1efef4e51e98' },
  { match: /kabel|cable|hub/i,                              id: 'photo-1601524909162-ae8725290836' },
]

export function productImageUrl(name: string, size: 'card' | 'detail' = 'card'): string | null {
  const id = SPECIFIC[name] ?? CATEGORY_FALLBACK.find((c) => c.match.test(name))?.id
  if (!id) return null
  const w = size === 'card' ? 400 : 800
  const h = size === 'card' ? 300 : 600
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

export function productEmoji(name: string): string {
  const n = name.toLowerCase()
  if (/macbook|laptop|thinkpad|zenbook|spectre|xps/.test(n)) return '💻'
  if (/iphone|galaxy s|pixel|oneplus|smartphone/.test(n)) return '📱'
  if (/ipad|tab\b|tablet/.test(n)) return '🖥️'
  if (/airpods|buds|headphone|wh-|qc|arctis/.test(n)) return '🎧'
  if (/speaker|jbl|charge 5/.test(n)) return '🔊'
  if (/switch|playstation|xbox|gaming/.test(n)) return '🎮'
  if (/monitor|ultrasharp/.test(n)) return '🖥️'
  if (/muis|mouse/.test(n)) return '🖱️'
  if (/toetsenbord|keys/.test(n)) return '⌨️'
  if (/oplader|adapter|power|kabel|hub/.test(n)) return '🔌'
  return '📦'
}
