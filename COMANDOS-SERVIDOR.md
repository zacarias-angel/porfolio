# Guía de comandos de servidor (Docker + Coolify + UFW)

> Notas de estudio del problema que tuvimos: los contenedores Docker no podían salir a internet.
> Causa: UFW estaba en `deny (routed)`, que dejaba el tráfico "reenviado" de Docker bloqueado.

---

## 1. Conceptos clave con analogías simples

| Concepto | Qué es | Analogía |
|---|---|---|
| **Contenedor Docker** | App empaquetada con su entorno, aislada pero liviana | Un departamento dentro de un edificio: tiene su cocina/baño (sus archivos), pero comparte la estructura del edificio (el kernel) |
| **Red Docker (bridge)** | Red privada virtual que conecta contenedores | El pasillo y los intercomunicadores del edificio |
| **Gateway (ej. 10.0.1.1)** | La "puerta de salida" de la red | La conserjería/portería que da a la calle |
| **NAT / MASQUERADE** | Reemplaza la IP privada del contenedor por la IP pública del servidor | Mandar una carta desde una oficina: todos los deptos usan la dirección de la oficina, y la conserjería reparte las respuestas al depto correcto |
| **UFW** | Firewall que decide qué entra y qué sale | El guardia de la portería |
| **Incoming / Outgoing / Routed** | Tráfico que entra al server / que sale del server / que *pasa de largo* entre redes | Entrar al edificio / salir a la calle / ir de un depto a otro depto o de un depto hacia afuera |
| **iptables FORWARD** | Cadena de reglas que controla el tráfico "routed" (el de los contenedores) | La política del guardia para el tránsito entre departamentos y la calle |
| **Reverse proxy (Traefik)** | Recibe peticiones de internet (80/443) y las reparte a la app correcta | Recepcionista que atiende la puerta y deriva a cada oficina |
| **DNS** | Traduce nombres (`api.github.com`) a IP (`140.82.113.5`) | Agenda telefónica |
| **Ping (ICMP)** | Prueba mínima: "¿estás ahí?" | Tocar el timbre |
| **TCP** | Conexión real para transferir datos (web, git, etc.) | Abrir la puerta y mantener una conversación |
| **MTU** | Tamaño máximo de un paquete | El ancho de la puerta del camión de reparto: si el paquete es más grande, no pasa |

---

## 2. Los comandos que usamos (qué hace cada uno)

### 2.1 Ver el estado de los contenedores

```bash
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
```
Qué hace: lista contenedores con nombre, estado e imagen.
Analogía: el directorio del edificio mostrando qué departamentos están ocupados y por quién.

```bash
docker logs coolify --tail 150 2>&1
```
Qué hace: muestra las últimas 150 líneas de log del contenedor `coolify`.
Analogía: leer el cuaderno de novedades de la portería.

```bash
docker logs -f coolify --tail 20
```
Qué hace: sigue los logs en vivo (`-f` = follow). Útil mientras disparás un deploy.
Analogía: quedarte parado viendo las novedades en tiempo real.

---

### 2.2 Ver la red dentro de un contenedor

```bash
docker exec coolify curl -v https://api.github.com/zen -m 15
```
Qué hace: ejecuta `curl` *dentro* del contenedor `coolify` (`docker exec`) con verbose (`-v`) y timeout de 15s (`-m 15`).
Analogía: entrar al depto y probar vos mismo si llega internet, no desde la calle.

```bash
docker exec coolify sh -c "getent hosts api.github.com"
```
Qué hace: resuelve el nombre a IP usando el resolver del contenedor.
Analogía: preguntar a la agenda telefónica del depto.

```bash
docker exec coolify sh -c "getent ahosts api.github.com"
```
Qué hace: como `hosts` pero muestra todas las direcciones (STREAM/DGRAM) e IPv4/IPv6.
Analogía: la agenda completa, con todos los teléfonos registrados.

```bash
docker exec coolify ping -c 2 10.0.1.1
docker exec coolify ping -c 2 8.8.8.8
```
Qué hace: prueba si hay conexión al gateway interno (10.0.1.1) y a internet (8.8.8.8 de Google).
Analogía: tocar el timbre de la conserjería y luego tocar el timbre de la casa de enfrente (internet).

```bash
docker exec coolify ping -c 1 -s 1400 8.8.8.8
docker exec coolify ping -c 1 -s 1472 8.8.8.8
```
Qué hace: ping con paquetes grandes para descartar problemas de MTU.
Analogía: probar si pasa un paquete grande por la puerta del camión.

---

### 2.3 Inspeccionar la red y el firewall del host

```bash
ip link | grep -E 'mtu|^[0-9]+'
```
Qué hace: muestra interfaces de red y su MTU.
Analogía: ver los planos de las cañerías/conexiones del edificio.

```bash
docker inspect coolify --format '{{json .NetworkSettings.Networks}}'
```
Qué hace: muestra a qué red está conectado el contenedor, su IP y gateway.
Analogía: ficha del depto con su número de puerta y piso.

```bash
sudo ufw status verbose
```
Qué hace: muestra el estado del firewall UFW y su política (`deny/allow` de incoming/outgoing/routed).
Analogía: preguntarle al guardia cuáles son sus órdenes generales.

```bash
sudo iptables -L FORWARD -n -v --line-numbers
```
Qué hace: lista las reglas de la cadena FORWARD (tráfico "routed"/de contenedores) con contadores.
Analogía: ver el libro de reglas del guardia para el tránsito interno.

```bash
sudo iptables -t nat -L POSTROUTING -n -v
```
Qué hace: muestra las reglas de NAT/MASQUERADE (las que traducen IPs privadas a públicas).
Analogía: ver cómo la conserjería re-etiqueta las cartas que salen.

```bash
sudo iptables -L DOCKER-USER -n -v
```
Qué hace: muestra la cadena que Docker crea para que puedas poner reglas propias.
Analogía: la casilla que Docker te deja libre para agregar tus propias reglas.

---

### 2.4 El arreglo

```bash
grep FORWARD_POLICY /etc/default/ufw
```
Qué hace: revisa la política de reenvío guardada en la config de UFW.
Analogía: leer la orden escrita que se le dio al guardia.

```bash
sudo sed -i 's/DEFAULT_FORWARD_POLICY="DROP"/DEFAULT_FORWARD_POLICY="ACCEPT"/' /etc/default/ufw
```
Qué hace: reemplaza `DROP` por `ACCEPT` en la config (`sed -i` = editar en el lugar).
Analogía: corregir la orden del guardia de "bloquear tránsito" a "permitir tránsito".

```bash
sudo ufw reload
```
Qué hace: recarga UFW para aplicar la nueva config.
Analogía: darle la nueva orden al guardia para que empiece a aplicarla.

```bash
sudo systemctl restart docker
```
Qué hace: reinicia el servicio Docker (reconstruye sus reglas de red).
Analogía: reiniciar la conserjería para que reordene todo.

```bash
docker exec coolify curl -sS -m 10 https://api.github.com/zen -o /dev/null -w '%{http_code}\n'
```
Qué hace: prueba rápida de salida a internet mostrando solo el código HTTP (200 = OK).
Analogía: verificación final de que el depto ya tiene internet.

---

## 3. Extras útiles para estudiar

```bash
# Ver cuánto ocupan los contenedores e imágenes
docker ps -a
docker images

# Entrar a una shell dentro de un contenedor
docker exec -it coolify bash

# Ver el estado de un servicio
systemctl status docker
systemctl status ufw

# Ver puertos en escucha
ss -tlnp

# Ver consumo de CPU/memoria
htop

# Seguir un archivo de log del host
tail -f /var/log/syslog

# Probar un puerto TCP específico (sin curl)
nc -zv 8.8.8.8 443

# Ver rutas de red
ip route
ip addr

# Ver configuración de Docker
cat /etc/docker/daemon.json

# Revisar las reglas de firewall actuales (resumen)
sudo iptables -S

# Forzar que un contenedor use un servidor DNS concreto
docker run --dns 8.8.8.8 --dns 1.1.1.1 ...
```

---

## 4. Cómo leer un log de acceso (nginx)

Formato típico:

```
10.0.1.6 - - [18/Aug/2026:05:02:03 +0000] "GET /robots.txt HTTP/1.1" 200 406 "-" "User-Agent" "10.0.1.1"
```

| Campo | Significado |
|---|---|
| `10.0.1.6` | Quién hizo la petición (IP de origen; acá es IP interna = viene del reverse proxy) |
| `[18/Aug/2026:05:02:03]` | Fecha y hora |
| `GET /robots.txt` | Método y ruta pedida |
| `200` | Código de respuesta (200 OK, 304 no modificado/caché, 404 no existe) |
| `406` | Tamaño de la respuesta en bytes |
| `"User-Agent"` | Quién es el cliente (navegador o bot) |
| `"10.0.1.1"` | La IP que originó la petición real (gateway/proxy) |

**Lo que viste en tus logs:**
- `AgentTrustBot` → bot de "descubrimiento de agentes IA" que busca `.well-known/agent-*.json`.
- `ClaudeBot` → el crawler de Anthropic (Claude), que pide `robots.txt` y `sitemap.xml`.
- Un navegador `Chrome` real → una persona visitando tu sitio.

Ninguno es un hackeo. Son **bots/crawlers** automatizados que recorren internet. Lo que hacen es ruido, no ataque.

El caso raro:
```
GET /%22/assets/index-qHmZksG9.js%22 HTTP/1.1
```
`%22` es el carácter `"` (comilla) codificado en URL. Significa que el navegador pidió una ruta que incluye comillas literales, porque tu HTML servido tiene una referencia rota (un `src` mal cerrado). Es un **bug de tu build/HTML**, no un intento de intrusión.

---

## 5. Si querés bloquear a los bots

```bash
# Ver reglas actuales de UFW (el 80/443 ya está permitido; esto es solo info)
sudo ufw status numbered
```

Para bloquear bots a nivel nginx se usa un `robots.txt` o una regla de User-Agent. Ejemplo simple en la config del sitio (nginx):

```nginx
if ($http_user_agent ~* "AgentTrustBot|ClaudeBot") {
    return 403;
}
```

(Después `nginx -t` para validar y recargar.) Esto es opcional: por defecto los bots respetuosos siguen tu `robots.txt`.
