import json
import urllib.request
import urllib.error
import time

base='http://127.0.0.1:8000'
email=f'autotest{int(time.time())}@example.com'
reg_payload={'fullName':'Auto Test','email':email,'password':'secret123','batchYear':2022}
req=urllib.request.Request(base+'/api/auth/register', data=json.dumps(reg_payload).encode('utf-8'), headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print('REGISTER', r.status, r.read().decode())
except urllib.error.HTTPError as e:
    print('REGISTER ERROR', e.code, e.read().decode())

login_payload={'email':email,'password':'secret123'}
req2=urllib.request.Request(base+'/api/auth/login', data=json.dumps(login_payload).encode('utf-8'), headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req2, timeout=10) as r:
        print('LOGIN', r.status, r.read().decode())
except urllib.error.HTTPError as e:
    print('LOGIN ERROR', e.code, e.read().decode())
