import geoip from 'geoip-lite';

export default function getCountry(req) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip;

  const geo = geoip.lookup(ip);

  return geo ? geo.country : null;
}
