# 🔐 Configuración de GitHub Secrets

Para que el pipeline de deployment funcione, debes configurar los siguientes secrets en tu repositorio de GitHub.

## 📋 Pasos para configurar Secrets

1. Ve a tu repositorio en GitHub: `https://github.com/ComiNow/app-service-employee`
2. Click en **Settings** (⚙️)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**
4. Click en **New repository secret** para cada uno de los siguientes:

---

## 🔑 Secrets Requeridos

### 1. AWS_ACCESS_KEY_ID
```
Nombre: AWS_ACCESS_KEY_ID
Valor: [Tu Access Key ID del usuario IAM github-actions-cominow-employee]
```
**Descripción:** Access Key del usuario IAM con permisos para S3 y CloudFront

---

### 2. AWS_SECRET_ACCESS_KEY
```
Nombre: AWS_SECRET_ACCESS_KEY
Valor: [Tu Secret Access Key del usuario IAM github-actions-cominow-employee]
```
**Descripción:** Secret Key del usuario IAM
**⚠️ IMPORTANTE:** Nunca compartas este valor públicamente

---

### 3. AWS_REGION
```
Nombre: AWS_REGION
Valor:
```
**Descripción:** Región de AWS donde están tus recursos

---

### 4. AWS_S3_BUCKET
```
Nombre: AWS_S3_BUCKET
Valor: cominow-employee-prod
```
**Descripción:** Nombre del bucket S3 donde se desplegará la aplicación

---

### 5. AWS_CLOUDFRONT_DISTRIBUTION_ID
```
Nombre: AWS_CLOUDFRONT_DISTRIBUTION_ID
Valor: d3gwsdg49ynx4o.cloudfront.net  # o el Distribution ID (ej: E123ABCDEF123)
```
**Descripción:** ID de la distribución de CloudFront o su dominio. El workflow soporta ambos formatos:

- Recomendado: usa el *Distribution ID* (ej: `E1A2B3C4D5E6F`) — es lo más preciso.
- Alternativa: puedes usar el *Domain Name* (ej: `d3gwsdg49ynx4o.cloudfront.net`) — el workflow intentará resolver automáticamente el Distribution ID vía la API de CloudFront.

Si el valor es un dominio, el workflow ejecutará `aws cloudfront list-distributions` y resolverá el ID automáticamente antes de crear la invalidación.

---

## ✅ Checklist de Verificación

Después de configurar todos los secrets, verifica:

- [ ] ✅ AWS_ACCESS_KEY_ID configurado
- [ ] ✅ AWS_SECRET_ACCESS_KEY configurado
- [ ] ✅ AWS_REGION configurado (us-east-1)
- [ ] ✅ AWS_S3_BUCKET configurado (cominow-employee-prod)
- [ ] ✅ AWS_CLOUDFRONT_DISTRIBUTION_ID configurado (d3gwsdg49ynx4o.cloudfront.net)

---

## 🧪 Probar el Deployment

Una vez configurados todos los secrets:

1. Haz un commit y push a la rama `main`
2. Ve a **Actions** en tu repositorio de GitHub
3. Verás el workflow "Deploy to AWS Production" ejecutándose
4. Si todo está bien configurado, verás ✅ en cada paso
5. Al finalizar, tu app estará disponible en: https://d3gwsdg49ynx4o.cloudfront.net

---

## 🔧 Solución de Problemas

### Error: "AccessDenied" en S3
- Verifica que las credenciales AWS sean correctas
- Revisa que el usuario IAM tenga la política `cominow-employee-deploy-policy` adjunta

### Error: "InvalidationBatch" en CloudFront
- Verifica que el Distribution ID sea correcto
- Asegúrate de incluir el ID completo, no solo el dominio

### Build falla
- Verifica que `npm run build` funcione localmente
- Revisa que todas las dependencias estén en `package.json`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del workflow en GitHub Actions
2. Verifica que todos los secrets estén correctamente configurados
3. Confirma que los recursos de AWS estén activos

---

Última actualización: 2025-11-04
