#!/usr/bin/env python3
"""從館慶配置 xlsx 匯入文字資料（略過圖片／連結欄位）。
用法：python3 scripts/import-xlsx.py 未整理素材/資料/館慶配置ver2.xlsx
輸出：src/data/generated/{vendors,speakers,programs}.json
"""
import json, os, re, sys, zipfile
import xml.etree.ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
RNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'


def load(path):
    z = zipfile.ZipFile(path)
    ss = [''.join(t.text or '' for t in si.iter('{%s}t' % NS['m']))
          for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    sheets = {}
    for s in ET.fromstring(z.read('xl/workbook.xml')).find('m:sheets', NS):
        rows = []
        for row in ET.fromstring(z.read('xl/' + rels[s.get(RNS)])).iter('{%s}row' % NS['m']):
            d = {}
            for c in row.findall('m:c', NS):
                v = c.find('m:v', NS)
                if v is None:
                    continue
                val = ss[int(v.text)] if c.get('t') == 's' else v.text
                d[re.sub(r'\d+', '', c.get('r'))] = clean(val)
            rows.append(d)
        sheets[s.get('name')] = rows
    return sheets


def clean(s):
    s = s.replace('\r', '').replace('\u200b', '').strip()
    return s


def by_header(rows):
    head = rows[0]
    out = []
    for r in rows[1:]:
        out.append({head[c]: v for c, v in r.items() if c in head and v})
    return out


def ig(v):
    return re.findall(r'@[\w.]+', v or '')


def main(path, outdir):
    sh = load(path)
    os.makedirs(outdir, exist_ok=True)

    # 書商（書店＋飲食）：編號 → 文字資料
    slot_to_id = {
        'Spot1-1': 'library', 'Spot1-2': 'glitch', 'Spot1-3': 'dmp', 'Spot1-4': 'meadowroom',
        'Spot1-5': 'pebbling', 'Spot1-6': 'wandertail', 'Spot1-7': 'onegu', 'Spot1-8': 'narcos',
        'Spot1-9 (SAT)': 'jammmm', 'Spot1-9 (SUN)': 'jilongli',
        'Spot2-1': 'spec', 'Spot2-2': 'yao', 'Spot2-3': 'carp', 'Spot2-4': 'artqpie', 'Spot2-5': 'springbao',
        'Spot3-1': 'nowhere', 'Spot3-2': 'nodate', 'Spot3-3': 'childreneyes', 'Spot3-4': 'storage', 'Spot3-5': 'jerrys', 'Spot3-6': 'aaa',
        'Spot4-1': 'prndl', 'Spot4-2': 'booksociety', 'Spot4-3': 'thingbooks', 'Spot4-4': 'thumbbooks',
        'Spot5-1': 'ssspace', 'Spot5-2': 'papaya', 'Spot5-3': 'phyllshin', 'Spot5-4': 'zitdim', 'Spot5-5': 'licorice', 'Spot5-6': 'weightbooks'
    }

    vendors = {}
    for name in ('書商夥伴', '書商夥伴-飲食攤'):
        for r in by_header(sh[name]):
            no = r.get('編號') or r.get('分區')
            if not no or not r.get('名稱'):
                continue
            v = {
                'no': no,
                'name': r.get('名稱'),
                'ready': r.get('素材確認') == '1',
                'note': r.get('備註'),
                'ig': ig(r.get('IG')),
                'introZh': r.get('簡介 中'),
                'introEn': r.get('簡介 英'),
            }
            books = []
            for i in (1, 2, 3):
                bn = r.get(f'book{i}_name')
                if bn:
                    books.append({
                        'name': bn,
                        'by': r.get(f'book{i}_author/publisher') or r.get(f'book{i}__author/publisher'),
                        'bio': r.get(f'book{i}_bio'),
                    })
            if books:
                v['books'] = books
            if r.get('販售品項餐點名稱'):
                v['menu'] = [x.strip() for x in r['販售品項餐點名稱'].split('\n') if x.strip()]
            if r.get('限定品項'):
                v['limited'] = r['限定品項']
            cleaned_v = {k: x for k, x in v.items() if x not in (None, '', [])}
            vendors[no] = cleaned_v
            vid = slot_to_id.get(no)
            if vid:
                vendors[vid] = cleaned_v

    # 論壇／沙龍講者
    speakers = []
    for r in by_header(sh['論壇、沙龍講者']):
        if '名稱' not in r:
            continue
        speakers.append({
            'name': r['名稱'].strip(' /'),
            'ready': r.get('素材確認') == '1',
            'note': r.get('備註'),
            'org': r.get('單位'),
            'ig': ig(r.get('IG')),
            'statement': r.get('2-3句話/活動介紹'),
            'bioZh': r.get('講者簡介 中'),
            'bioEn': r.get('講者簡介 英'),
        })
    speakers = [{k: x for k, x in s.items() if x not in (None, '', [])} for s in speakers]
    speakers = [s for s in speakers if len(s) > 2]  # 略過「論壇」「沙龍」分區標題列

    # 其他活動（工作坊、導覽、Silent Party、安靜共讀）
    programs = []
    for r in by_header(sh['其他活動']):
        if '活動名稱' not in r:
            continue
        programs.append({
            'title': r['活動名稱'],
            'when': r.get('日期') or r.get('時間'),
            'time': r.get('時間'),
            'venue': r.get('地點'),
            'host': r.get('活動單位/主講者'),
            'hostBio': r.get('單位/主講者介紹'),
            'ig': ig(r.get('IG')),
            'intro': r.get('活動簡介'),
        })
    programs = [{k: x for k, x in p.items() if x not in (None, '', [])} for p in programs]
    programs = [p for p in programs if len(p) > 2]  # 略過分區標題列
    for p in programs:  # Excel 日期序號 → ISO
        if re.fullmatch(r'\d{5}(\.0)?', p.get('when', '')):
            import datetime
            p['when'] = (datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(p['when'])))).isoformat()

    for fn, data in (('vendors', vendors), ('speakers', speakers), ('programs', programs)):
        with open(os.path.join(outdir, fn + '.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        print(fn, len(data))


if __name__ == '__main__':
    main(sys.argv[1], os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'generated'))
