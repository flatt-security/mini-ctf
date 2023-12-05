#include <fcntl.h>
#include <unistd.h>

int main(void) {
    char flag[256] = {0};
    int fd = open("/flag", O_RDONLY);
    int len = read(fd, flag, sizeof(flag));
    close(fd);
    write(1, flag, len);
}
