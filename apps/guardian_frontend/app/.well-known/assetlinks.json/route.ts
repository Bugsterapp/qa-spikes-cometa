import { NextResponse } from 'next/server';

export function GET() {
  const data = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.cometa.app',
        sha256_cert_fingerprints: [
          '36:31:D3:88:26:7B:32:02:95:B0:8F:D0:61:E9:82:71:44:24:45:3D:DF:06:35:53:3C:9C:D0:28:BA:AB:5A:AF',
        ],
      },
    },
  ];
  return NextResponse.json(data, {
    headers: { 'Content-Type': 'application/json' }, // explícito
  });
}
