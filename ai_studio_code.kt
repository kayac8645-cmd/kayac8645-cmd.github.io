package com.example.llmworld

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// ==========================================
// 1. RENK PALETİ & TEMA
// ==========================================
val OledBackground = Color(0xFF030712)
val OledSurface = Color(0xFF0F172A)
val OledSurfaceCard = Color(0xFF1E293B)
val OledSurfaceVariant = Color(0xFF111827)
val OledBorder = Color(0xFF334155)
val OledBorderSubtle = Color(0xFF1E293B)
val CyanPrimary = Color(0xFF06B6D4)
val NeonViolet = Color(0xFF8B5CF6)
val ElectricBlue = Color(0xFF3B82F6)
val TextPrimary = Color(0xFFF9FAFB)
val TextSecondary = Color(0xFF94A3B8)
val TextMuted = Color(0xFF64748B)
val UserBubbleBg = Color(0xFF1E293B)
val AssistantBubbleBg = Color(0xFF0B0F19)
val ErrorRed = Color(0xFFEF4444)

// ==========================================
// 2. VERİ MODELLERİ & KATEGORİLER
// ==========================================
enum class ModelCategory(val displayName: String) {
    RECOMMENDED("Önerilen"),
    COMPACT("⚡ Hafif & Hızlı"),
    REASONING("🧠 Akıl Yürütme (CoT)"),
    CODING("💻 Kodlama & Yazılım"),
    MULTILINGUAL("🌐 Çok Dilli"),
    ADVANCED("🚀 Amiral Gemisi")
}

data class ModelPreset(
    val id: String,
    val name: String,
    val author: String,
    val parameterCount: String,
    val quantization: String,
    val category: ModelCategory,
    val description: String
)

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val tokensPerSecond: Float = 0f,
    val tokensCount: Int = 0
)

// ==========================================
// 3. AĞ DURUMU TAKİPÇİSİ (ONLINE/OFFLINE)
// ==========================================
class NetworkMonitor(context: Context) {
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    val isOnline: Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(true) }
            override fun onLost(network: Network) { trySend(false) }
        }
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(request, callback)

        val caps = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
        trySend(caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true)

        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }
}

// ==========================================
// 4. VIEWMODEL (SOHBET & ÇIKARIM MOTORU)
// ==========================================
class LlmViewModel : ViewModel() {
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isStreaming = MutableStateFlow(false)
    val isStreaming: StateFlow<Boolean> = _isStreaming.asStateFlow()

    private val _streamingContent = MutableStateFlow("")
    val streamingContent: StateFlow<String> = _streamingContent.asStateFlow()

    private val _selectedModel = MutableStateFlow(
        ModelPreset(
            id = "qwen-2.5-0.5b",
            name = "Qwen 2.5 0.5B Instruct",
            author = "Alibaba Cloud",
            parameterCount = "0.5B",
            quantization = "Q4_K_M",
            category = ModelCategory.RECOMMENDED,
            description = "Hızlı ve Türkçe destekli cihaz içi kompakt model."
        )
    )
    val selectedModel: StateFlow<ModelPreset> = _selectedModel.asStateFlow()

    private val _isWebSearchEnabled = MutableStateFlow(true)
    val isWebSearchEnabled: StateFlow<Boolean> = _isWebSearchEnabled.asStateFlow()

    fun toggleWebSearch() {
        _isWebSearchEnabled.value = !_isWebSearchEnabled.value
    }

    fun selectModel(preset: ModelPreset) {
        _selectedModel.value = preset
    }

    fun clearChat() {
        _messages.value = emptyList()
    }

    fun sendMessage(userText: String) {
        if (userText.isBlank() || _isStreaming.value) return

        val userMessage = ChatMessage(role = "user", content = userText.trim())
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _isStreaming.value = true
            _streamingContent.value = ""

            // Simüle Edilmiş Yerel Çıkarım & Hibrit Akış
            val isReasoning = _selectedModel.value.category == ModelCategory.REASONING
            val fullResponse = if (isReasoning) {
                "<think>\nKullanıcının sorusu analiz ediliyor: \"$userText\"\nAdım 1: Bağlam incelendi.\nAdım 2: Mantıksal çıkarım tamamlandı.\n</think>\n\nSorunuz için yanıt:\n$userText konusuna ilişkin cihaz içi yerel çıkarım başarıyla gerçekleştirildi. GGUF modeli %100 çevrimdışı ve güvenli şekilde çalışıyor."
            } else {
                "Merhaba! **${_selectedModel.value.name}** modeli üzerinden yanıt veriyorum.\n\nSorduğunuz soru: \"$userText\"\n\nLLM WORLD motoru doğrudan cihazınızın ARM CPU/GPU donanımını kullanarak bu cevabı üretti."
            }

            var currentText = ""
            val startTime = System.currentTimeMillis()
            val words = fullResponse.split(" ")

            for (word in words) {
                if (!_isStreaming.value) break
                currentText += (if (currentText.isEmpty()) "" else " ") + word
                _streamingContent.value = currentText
                delay(40) // Akıcı token akışı
            }

            val elapsedSec = ((System.currentTimeMillis() - startTime) / 1000f).coerceAtLeast(0.1f)
            val tokensPerSec = words.size / elapsedSec

            _messages.value = _messages.value + ChatMessage(
                role = "assistant",
                content = currentText,
                tokensPerSecond = tokensPerSec,
                tokensCount = words.size
            )
            _isStreaming.value = false
            _streamingContent.value = ""
        }
    }

    fun stopGeneration() {
        _isStreaming.value = false
    }
}

// ==========================================
// 5. ANA EKRAN & ARAYÜZ BİLEŞENLERİ
// ==========================================
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val networkMonitor = NetworkMonitor(applicationContext)

        setContent {
            val isOnline by networkMonitor.isOnline.collectAsState(initial = true)
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = OledBackground) {
                    LlmWorldScreen(isOnline = isOnline)
                }
            }
        }
    }
}

@Composable
fun LlmWorldScreen(
    viewModel: LlmViewModel = viewModel(),
    isOnline: Boolean
) {
    val messages by viewModel.messages.collectAsState()
    val isStreaming by viewModel.isStreaming.collectAsState()
    val streamingContent by viewModel.streamingContent.collectAsState()
    val selectedModel by viewModel.selectedModel.collectAsState()
    val isWebSearchEnabled by viewModel.isWebSearchEnabled.collectAsState()

    var inputText by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<ModelCategory?>(null) }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size, streamingContent) {
        if (messages.isNotEmpty() || isStreaming) {
            listState.animateScrollToItem((messages.size).coerceAtLeast(0))
        }
    }

    Scaffold(
        containerColor = OledBackground,
        topBar = {
            Column(modifier = Modifier.background(OledSurface)) {
                // ChatGPT Tarzı Üst Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "LLM WORLD",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = TextPrimary
                    )

                    // Model Hap Rozeti
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(OledSurfaceCard)
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(if (isOnline) CyanPrimary else Color(0xFFF59E0B))
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = selectedModel.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary,
                            maxLines = 1
                        )
                    }

                    IconButton(onClick = { viewModel.clearChat() }) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Yeni Sohbet",
                            tint = CyanPrimary
                        )
                    }
                }

                // Kategori Filtreleme Çubuğu
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(if (selectedCategory == null) CyanPrimary else OledSurfaceCard)
                            .clickable { selectedCategory = null }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Tümü",
                            fontSize = 11.sp,
                            color = if (selectedCategory == null) Color.Black else TextSecondary
                        )
                    }
                    ModelCategory.values().forEach { cat ->
                        val isSel = selectedCategory == cat
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isSel) CyanPrimary else OledSurfaceCard)
                                .clickable { selectedCategory = if (isSel) null else cat }
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = cat.displayName,
                                fontSize = 11.sp,
                                color = if (isSel) Color.Black else TextSecondary
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            // ChatGPT Tarzı Alt Giriş Çubuğu
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(OledSurface)
                    .navigationBarsPadding()
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Bottom
                ) {
                    IconButton(onClick = { viewModel.toggleWebSearch() }) {
                        Icon(
                            imageVector = if (isWebSearchEnabled) Icons.Default.Public else Icons.Default.PublicOff,
                            contentDescription = "Web",
                            tint = if (isWebSearchEnabled && isOnline) CyanPrimary else TextMuted
                        )
                    }

                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        modifier = Modifier.weight(1f),
                        placeholder = {
                            Text(
                                text = if (isStreaming) "Üretiliyor..." else "ChatGPT'ye mesaj gönder...",
                                color = TextMuted,
                                fontSize = 14.sp
                            )
                        },
                        maxLines = 4,
                        shape = RoundedCornerShape(22.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = OledSurfaceVariant,
                            unfocusedContainerColor = OledSurfaceVariant,
                            focusedBorderColor = CyanPrimary,
                            unfocusedBorderColor = OledBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        )
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    if (isStreaming) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(ErrorRed)
                                .clickable { viewModel.stopGeneration() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Stop, contentDescription = "Durdur", tint = Color.White)
                        }
                    } else {
                        val canSend = inputText.isNotBlank()
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(if (canSend) CyanPrimary else OledSurfaceCard)
                                .clickable(enabled = canSend) {
                                    viewModel.sendMessage(inputText)
                                    inputText = ""
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.ArrowUpward,
                                contentDescription = "Gönder",
                                tint = if (canSend) Color.Black else TextMuted
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        if (messages.isEmpty() && !isStreaming) {
            // Boş Karşılama Ekranı
            EmptyChatWelcome(onSelectPrompt = { prompt ->
                viewModel.sendMessage(prompt)
            })
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(messages, key = { _, msg -> msg.id }) { _, msg ->
                    MessageBubble(message = msg)
                }
                if (isStreaming) {
                    item {
                        StreamingBubble(content = streamingContent)
                    }
                }
            }
        }
    }
}

// ==========================================
// 6. MESAJ BALONLARI & ANİMASYONLAR
// ==========================================
@Composable
fun MessageBubble(message: ChatMessage) {
    val isUser = message.role == "user"
    val context = LocalContext.current

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(CyanPrimary),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
            }
            Spacer(modifier = Modifier.width(6.dp))
        }

        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (isUser) UserBubbleBg else AssistantBubbleBg)
                .border(1.dp, OledBorderSubtle, RoundedCornerShape(16.dp))
                .padding(12.dp)
        ) {
            Column {
                Text(
                    text = message.content,
                    color = TextPrimary,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
                if (!isUser && message.tokensPerSecond > 0) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${String.format(Locale.US, "%.1f", message.tokensPerSecond)} t/s • ${message.tokensCount} tokens",
                        fontSize = 10.sp,
                        color = CyanPrimary,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}

@Composable
fun StreamingBubble(content: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(CyanPrimary),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.width(6.dp))
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(AssistantBubbleBg)
                .border(1.dp, CyanPrimary.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                .padding(12.dp)
        ) {
            if (content.isBlank()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Düşünüyor...", color = CyanPrimary, fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    BouncingDots()
                }
            } else {
                Text(text = content, color = TextPrimary, fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun BouncingDots() {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    val offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = -5f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bounce"
    )

    Row(horizontalArrangement = Arrangement.spacedBy(3.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.offset(y = offset.dp).size(5.dp).clip(CircleShape).background(CyanPrimary))
        Box(modifier = Modifier.offset(y = (-offset).dp).size(5.dp).clip(CircleShape).background(NeonViolet))
        Box(modifier = Modifier.offset(y = offset.dp).size(5.dp).clip(CircleShape).background(ElectricBlue))
    }
}

@Composable
fun EmptyChatWelcome(onSelectPrompt: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(CyanPrimary),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.Black, modifier = Modifier.size(32.dp))
        }
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Bugün sana nasıl yardımcı olabilirim?",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "ARM64 Cihaz İçi Yerel LLM & Hibrit Arama",
            fontSize = 12.sp,
            color = TextMuted
        )
        Spacer(modifier = Modifier.height(24.dp))

        val prompts = listOf(
            "DeepSeek R1 akıl yürütme ile mantık analizi yap",
            "Kotlin Coroutines ile StateFlow kullanımını açıkla",
            "GGUF formatı ve kuantizasyon nedir?"
        )
        prompts.forEach { p ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(OledSurfaceCard)
                    .border(1.dp, OledBorderSubtle, RoundedCornerShape(12.dp))
                    .clickable { onSelectPrompt(p) }
                    .padding(12.dp)
            ) {
                Text(text = p, color = TextPrimary, fontSize = 13.sp)
            }
        }
    }
}