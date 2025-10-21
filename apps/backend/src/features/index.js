const { Router } = require('express');

const router = Router();

// Feature subroutes
try { router.use('/auth', require('./auth/routes')); } catch (e) { console.error('Mount /auth failed:', e); }
try { router.use('/users', require('./users/routes')); } catch (e) { console.error('Mount /users failed:', e); }
try { router.use('/configuration', require('./configuration/routes')); } catch (e) { console.error('Mount /configuration failed:', e); }
try { router.use('/routes', require('./routes/routes')); } catch (e) { console.error('Mount /routes failed:', e); }
try { router.use('/accounts', require('./accounts/routes')); } catch (e) { console.error('Mount /accounts failed:', e); }
try { router.use('/collections', require('./collections/routes')); } catch (e) { console.error('Mount /collections failed:', e); }
// try { router.use('/configuration', require('./configuration/routes')); } catch {}
// try { router.use('/routes', require('./routes/routes')); } catch {}
// try { router.use('/accounts', require('./accounts/routes')); } catch {}
try { router.use('/collections', require('./collections/routes')); } catch {}

router.get('/', (_req, res) => res.json({ ok: true, scope: 'features' }));

module.exports = router;
